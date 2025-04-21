// main.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  initGrid,
  stepWFC,
  drawGrid
} from "./logic.js";

const container = document.getElementById("renderer");
const width = container.clientWidth;
const height = container.clientHeight;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
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

initGrid(scene);

let done = false;
function animate() {
  controls.update();
  if (!done) {
    let changed = true;
    while (changed && performance.now() % 2 < 1) {
      changed = stepWFC();
      if (!changed) done = true;
    }
    drawGrid(scene);
  }
  renderer.render(scene, camera);
}

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