// import * as THREE from "three";

// ─── Tile definitions ───
// 0=Village,1=Plain,2=Forest,3=Hill,4=Sand,5=River
export const tileSet = [
  {
    id: 0,
    name: "Village",
    color: 0xecb194,
    canConnectTo: [0, 1, 3],
    textures: [
      1,
      ["public/sprites/Houses.png", [4, 3], []],
      ["public/sprites/Huts.png", [1, 5], []],
      ["public/sprites/Market.png", [4, 3], []],
      ["public/sprites/Resources.png", [5, 3], []],
      ["public/sprites/Tarverns.png", [4, 3], []],
      ["public/sprites/Workshops.png", [3, 3], []],
      ["public/sprites/Wheatfield.png", [1, 4], []],
    ],
  },
  {
    id: 1,
    name: "Plain",
    color: 0xbee8a5,
    canConnectTo: [0, 1, 2, 3, 4, 5],
    textures: [-1, ["public/sprites/Grass.png", [0, 5], [[0, 1]]]],
  },
  {
    id: 2,
    name: "Forest",
    color: 0x60975c,
    canConnectTo: [1, 2, 3],
    textures: [
      1,
      [
        "public/sprites/WinterTrees.png",
        [4, 4],
        [
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 1],
          [1, 2],
          [1, 3],
          [2, 1],
          [2, 2],
          [2, 3],
        ],
      ],
    ],
  },
  {
    id: 3,
    name: "Hill",
    color: 0x9fae8e,
    canConnectTo: [1, 2, 3],
    textures: [
      1,
      [
        "public/sprites/Cliff.png",
        [9, 7],
        [
          [0, 3],
          [0, 4],
        ],
      ],
    ],
  },
  {
    id: 4,
    name: "Sand",
    color: 0xe8d897,
    canConnectTo: [1, 4, 5],
    textures: [-1, ["public/sprites/Shore.png", [0, 5], [[0, 0]]]],
  },
  {
    id: 5,
    name: "River",
    color: 0x94bdec,
    canConnectTo: [1, 4, 5],
    textures: [-1, ["public/sprites/Shore.png", [0, 5], [[0, 3]]]],
  },
];

// ─── Weights ───
export const tileWeights = {};
tileSet.forEach((t) => (tileWeights[t.id] = 1));
export function setTileWeight(id, w) {
  tileWeights[id] = w;
}

// ─── Grid settings & state ───
export const tilesX = 32;
export const tilesY = 32;
export const tileSize = 32;
export const grid = Array.from({ length: tilesY }, () =>
  Array.from({ length: tilesX }, () => ({
    collapsed: false,
    drawn: false,
    possible: tileSet.map((t) => t.id),
  }))
);

// ─── RNG ───
let seededRandom = Math.random;
export function setSeed(s) {
  seededRandom = mulberry32(s >>> 0);
}
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Helpers ───
function randomFrom(arr) {
  return arr[Math.floor(seededRandom() * arr.length)];
}
function weightedRandomFrom(arr) {
  const total = arr.reduce((sum, id) => sum + (tileWeights[id] || 0), 0);
  let r = seededRandom() * total;
  for (const id of arr) {
    const w = tileWeights[id] || 0;
    if (r < w) return id;
    r -= w;
  }
  return arr[0];
}
function getNeighborCoords(x, y) {
  const c = [];
  if (y > 0) c.push([x, y - 1]);
  if (x < tilesX - 1) c.push([x + 1, y]);
  if (y < tilesY - 1) c.push([x, y + 1]);
  if (x > 0) c.push([x - 1, y]);
  return c;
}

// ─── Collapse & Propagate ───
export function collapseCell(cell) {
  const choice = weightedRandomFrom(cell.possible);
  cell.collapsed = true;
  cell.possible = [choice];
}
export function propagate(x, y) {
  const cur = grid[y][x].possible[0];
  const valid = tileSet[cur].canConnectTo;
  getNeighborCoords(x, y).forEach(([nx, ny]) => {
    const nb = grid[ny][nx];
    if (!nb.collapsed) {
      nb.possible = nb.possible.filter((id) => valid.includes(id));
    }
  });
}

// ─── WFC Step ───
export function stepWFC() {
  const opts = [];
  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      const c = grid[y][x];
      if (!c.collapsed && c.possible.length > 0) {
        opts.push({ x, y, entropy: c.possible.length });
      }
    }
  }
  if (opts.length === 0) {
    // fix dead-ends
    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const c = grid[y][x];
        if (!c.collapsed && c.possible.length === 0) {
          c.possible = [1];
          c.collapsed = true;
        }
      }
    }
    return false;
  }
  opts.sort((a, b) => a.entropy - b.entropy);
  const lows = opts.filter((o) => o.entropy === opts[0].entropy);
  const { x, y } = randomFrom(lows);
  const cell = grid[y][x];
  if (cell.possible.length === 0) {
    cell.possible = [1];
    cell.collapsed = true;
    return true;
  }
  collapseCell(cell);
  propagate(x, y);
  return true;
}

// ─── Draw & Init ───
export function drawGrid(scene) {
  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      const c = grid[y][x];
      if (c.collapsed && !c.drawn) {
        const td = tileSet[c.possible[0]];
        if (td.textures[0] != -1) {
          const texture = loadTexture(
            tileSet.filter(function (o) {
              return o.id == td.textures[0];
            })[0].textures
          );
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
          });
          const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(tileSize, tileSize),
            material
          );
          mesh.position.set(
            x * tileSize - (tilesX * tileSize) / 2 + tileSize / 2,
            -y * tileSize + (tilesY * tileSize) / 2 - tileSize / 2,
            -10
          );
          scene.add(mesh);
        }

        const texture = loadTexture(td.textures);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(tileSize, tileSize),
          material
        );
        mesh.position.set(
          x * tileSize - (tilesX * tileSize) / 2 + tileSize / 2,
          -y * tileSize + (tilesY * tileSize) / 2 - tileSize / 2,
          0
        );
        scene.add(mesh);
        c.drawn = true;
      }
    }
  }
}

// Example texture loader function (you'll need to implement this properly)
function loadTexture(textures) {
  const randomTexture = randomFrom(textures.slice(1));
  const texture = new THREE.TextureLoader().load(randomTexture[0]);
  const totalRow = randomTexture[1][0];
  const totalCol = randomTexture[1][1];
  let row, col;
  if (randomTexture[2].length == 0) {
    row = Math.floor(totalRow * seededRandom());
    col = Math.floor(totalCol * seededRandom());
  } else {
    const randomSprite = randomFrom(randomTexture[2]);
    row = randomSprite[0];
    col = randomSprite[1];
  }
  return cropSprite(texture, totalRow, totalCol, row, col);
}

function cropSprite(texture, totalRows, totalColumns, row, column) {
  const frameWidth = 1 / totalColumns;
  const frameHeight = 1 / totalRows;

  const croppedTexture = texture.clone();
  croppedTexture.repeat.set(frameWidth, frameHeight);
  croppedTexture.offset.set(
    (column+1/32) * frameWidth,
    1 - frameHeight - (row-1/32) * frameHeight
  );
  croppedTexture.needsUpdate = true;
  croppedTexture.center.set(0, 0); // Important to reset center if needed
  croppedTexture.rotation = 0;

  return croppedTexture;
}
export function initGrid(scene, customSeed) {
  if (customSeed != null) setSeed(customSeed);
  else setSeed(Math.floor(Math.random() * 0xffffffff));
  drawGrid(scene);
}
