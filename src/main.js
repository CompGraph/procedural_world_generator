import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const container = document.getElementById("renderer");
const width = container.clientWidth;
const height = container.clientHeight;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// === Tile Definitions ===
const tileSet = [
  { id: 0, name: "Water", color: 0x3399ff, canConnectTo: [0, 2] },
  { id: 1, name: "Grass", color: 0x66cc33, canConnectTo: [0, 1, 4] },
  { id: 2, name: "Rock", color: 0x999999, canConnectTo: [1, 2] },
  { id: 3, name: "Sand", color: 0xffcc66, canConnectTo: [0, 3] },
  { id: 4, name: "Lava", color: 0xff3300, canConnectTo: [1, 4] },
];

// === Grid Settings ===
const tilesX = 50;
const tilesY = 30;
const tileSize = 20;

const grid = Array.from({ length: tilesY }, () =>
  Array.from({ length: tilesX }, () => ({
    collapsed: false,
    drawn: false,
    possible: [0, 1, 2, 3, 4],
  }))
);

// === Helpers ===
function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getNeighborCoords(x, y) {
  const coords = [];
  if (y > 0) coords.push([x, y - 1]);             // top
  if (x < tilesX - 1) coords.push([x + 1, y]);     // right
  if (y < tilesY - 1) coords.push([x, y + 1]);     // bottom
  if (x > 0) coords.push([x - 1, y]);             // left
  return coords;
}

function collapseCell(cell) {
  const choice = randomFrom(cell.possible);
  cell.collapsed = true;
  cell.possible = [choice];
}

function propagate(x, y) {
  const neighbors = getNeighborCoords(x, y);
  const current = grid[y][x].possible[0];

  neighbors.forEach(([nx, ny]) => {
    const neighbor = grid[ny][nx];
    if (!neighbor.collapsed) {
      const valid = tileSet[current].canConnectTo;
      neighbor.possible = neighbor.possible.filter((id) =>
        valid.includes(id)
      );
    }
  });
}

function stepWFC() {
  const options = [];

  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      const cell = grid[y][x];
      if (!cell.collapsed && cell.possible.length > 0) {
        options.push({ x, y, entropy: cell.possible.length });
      }
    }
  }

  if (options.length === 0) {
    // Check if any are uncollapsed and broken
    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const cell = grid[y][x];
        if (!cell.collapsed && cell.possible.length === 0) {
          // Force collapse to a fallback tile (e.g. grass)
          cell.possible = [1]; // use tile 1 = Grass
          cell.collapsed = true;
        }
      }
    }
    return false;
  }

  options.sort((a, b) => a.entropy - b.entropy);
  const lowest = options.filter(c => c.entropy === options[0].entropy);
  const chosen = randomFrom(lowest);

  const cell = grid[chosen.y][chosen.x];
  if (cell.possible.length === 0) {
    // Recovery fallback
    cell.possible = [1]; // grass
    cell.collapsed = true;
    return true;
  }

  collapseCell(cell);
  propagate(chosen.x, chosen.y);

  return true;
}

function drawGrid() {
  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      const cell = grid[y][x];
      if (cell.collapsed && !cell.drawn) {
        const tileID = cell.possible[0];
        const tileData = tileSet[tileID];

        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(tileSize, tileSize),
          new THREE.MeshBasicMaterial({ color: tileData.color })
        );
        mesh.position.set(
          x * tileSize - (tilesX * tileSize) / 2 + tileSize / 2,
          -y * tileSize + (tilesY * tileSize) / 2 - tileSize / 2,
          0
        );
        scene.add(mesh);
        cell.drawn = true;
      }
    }
  }
}

// === Camera Setup ===
const camera = new THREE.OrthographicCamera(
  width / -2,
  width / 2,
  height / 2,
  height / -2,
  1,
  5000
);
camera.position.z = 1000;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Animate ===
let done = false;

function animate() {
  controls.update();

  if (!done) {
    let changed = true;
    while (changed && performance.now() % 2 < 1) {
      changed = stepWFC();
      if (!changed) done = true;
    }
    drawGrid();
  }

  renderer.render(scene, camera);
}

// === Resize Support ===
const resizeObserver = new ResizeObserver(() => {
  const newWidth = container.clientWidth;
  const newHeight = container.clientHeight;

  camera.left = newWidth / -2;
  camera.right = newWidth / 2;
  camera.top = newHeight / 2;
  camera.bottom = newHeight / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
});
resizeObserver.observe(container);
