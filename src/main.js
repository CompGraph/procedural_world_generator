import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const colors = [0xff6f61, 0x6fa8dc, 0x93c47d];
const materials = [
  new THREE.MeshBasicMaterial({ color: colors[0] }), // Front
  new THREE.MeshBasicMaterial({ color: colors[0] }), // Back
  new THREE.MeshBasicMaterial({ color: colors[1] }), // Left
  new THREE.MeshBasicMaterial({ color: colors[1] }), // Right
  new THREE.MeshBasicMaterial({ color: colors[2] }), // Top
  new THREE.MeshBasicMaterial({ color: colors[2] }), // Bottom
];
const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

camera.position.z = 5;
controls.update();

function animate() {
  cube.rotation.y += 0.01;

  // for the damping
  controls.update();

  renderer.render(scene, camera);
}