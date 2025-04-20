import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

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

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshBasicMaterial({
    color: 0xff6f61,
  })
);
scene.add(plane);

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(200, 200, 200),
  new THREE.MeshBasicMaterial({ color: 0x93c47d })
);
cube2.position.set(100, 100, 100);
scene.add(cube2);

function animate() {
  controls.update();

  renderer.render(scene, camera);
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.left = width / -2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = height / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

window.addEventListener("resize", onWindowResize);
