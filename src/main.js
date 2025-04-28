import "./chunk_page.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { initGrid, stepWFC, drawGrid, grid } from "./logic.js";
import { allowedChunks } from "./chunk_page.js";

// DOM
const container       = document.getElementById("renderer");
const useSeedCheckbox = document.getElementById("use-seed");
const seedInput       = document.getElementById("no");
const seedDisplay     = document.getElementById("seed-display");
const generateButton  = document.getElementById("add-button");

// Three.js
let width  = container.clientWidth;
let height = container.clientHeight;
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(width,height);
container.appendChild(renderer.domElement);

const scene  = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  width/-2, width/2, height/2, height/-2, 0.1, 2000
);
camera.position.set(0,0,1000);
camera.zoom = 0.8;

const controls = new OrbitControls(camera,renderer.domElement);
controls.enableRotate  = false;
controls.enableDamping = true;

// WFC state
let done = true, seed;

// hide seed UI initially
seedInput.disabled        = true;
seedInput.style.display   = "none";
seedDisplay.style.display = "none";

// toggle seed input
useSeedCheckbox.addEventListener("change", ()=>{
  const on = useSeedCheckbox.checked;
  seedInput.disabled      = !on;
  seedInput.style.display = on ? "block" : "none";
  if(!on) {
    seedInput.value = "";
    seedDisplay.style.display = "none";
  }
});

// start with seed
function startWithSeed(s){
  // clear old meshes
  scene.children
    .filter(o=>o.isMesh)
    .forEach(o=>scene.remove(o));

  // reset grid with allowedChunks
  const base = Array.from(allowedChunks);
  grid.forEach(r=>r.forEach(c=>{
    c.collapsed = false; c.drawn = false; c.possible = base.slice();
  }));

  // show & store seed
  seed = s>>>0;
  seedInput.style.display   = "block";
  seedInput.value           = seed;
  seedDisplay.textContent   = `This is seed: ${seed}`;
  seedDisplay.style.display = "block";

  // run WFC
  done = false;
  initGrid(scene, seed);
}

// generate click
generateButton.addEventListener("click", ()=>{
  let s;
  if(useSeedCheckbox.checked){
    s = parseInt(seedInput.value,10);
    if(isNaN(s)) s = Math.floor(Math.random()*0xffffffff);
  } else {
    s = Math.floor(Math.random()*0xffffffff);
  }
  startWithSeed(s);
});

// animation
function animate(){
  controls.update();
  if(!done){
    const changed = stepWFC();
    if(!changed){
      done = true;
      console.log(`WFC complete — seed: ${seed}`);
    }
    drawGrid(scene);
  }
  renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);

// resize
new ResizeObserver(()=>{
  width  = container.clientWidth;
  height = container.clientHeight;
  camera.left   = width/-2;
  camera.right  = width/2;
  camera.top    = height/2;
  camera.bottom = height/-2;
  camera.updateProjectionMatrix();
  renderer.setSize(width,height);
}).observe(container);
