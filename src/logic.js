// logic.js
import * as THREE from "three";

export const tileSet = [
  { id: 0, name: "Water", color: 0x3399ff, canConnectTo: [0, 2] },
  { id: 1, name: "Grass", color: 0x66cc33, canConnectTo: [0, 1, 4] },
  { id: 2, name: "Rock", color: 0x999999, canConnectTo: [1, 2] },
  { id: 3, name: "Sand", color: 0xffcc66, canConnectTo: [0, 3] },
  { id: 4, name: "Lava", color: 0xff3300, canConnectTo: [1, 4] },
];

export const tilesX = 50;
export const tilesY = 30;
export const tileSize = 20;

export const grid = Array.from({ length: tilesY }, () =>
  Array.from({ length: tilesX }, () => ({
    collapsed: false,
    drawn: false,
    possible: [0, 1, 2, 3, 4],
  }))
);

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getNeighborCoords(x, y) {
  const coords = [];
  if (y > 0) coords.push([x, y - 1]);
  if (x < tilesX - 1) coords.push([x + 1, y]);
  if (y < tilesY - 1) coords.push([x, y + 1]);
  if (x > 0) coords.push([x - 1, y]);
  return coords;
}

export function collapseCell(cell) {
  const choice = randomFrom(cell.possible);
  cell.collapsed = true;
  cell.possible = [choice];
}

export function propagate(x, y) {
  const neighbors = getNeighborCoords(x, y);
  const current = grid[y][x].possible[0];
  neighbors.forEach(([nx, ny]) => {
    const neighbor = grid[ny][nx];
    if (!neighbor.collapsed) {
      const valid = tileSet[current].canConnectTo;
      neighbor.possible = neighbor.possible.filter(id => valid.includes(id));
    }
  });
}

export function stepWFC() {
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
    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const cell = grid[y][x];
        if (!cell.collapsed && cell.possible.length === 0) {
          cell.possible = [1];
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
    cell.possible = [1];
    cell.collapsed = true;
    return true;
  }

  collapseCell(cell);
  propagate(chosen.x, chosen.y);
  return true;
}

export function drawGrid(scene) {
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

export function initGrid(scene) {
  drawGrid(scene);
}
