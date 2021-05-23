import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { NoToneMapping } from "three";

const canvas = document.querySelector("#c");
const loadingPage = document.querySelector(".before");
const mobileControls = document.querySelector(".mobileControls");
const beforeBtn = document.querySelector(".before-enterBtn");
const backgroundColor = "white";
const loadingBar = document.querySelector(".loadingBar");
const loadingBarC = document.querySelector(".progress");
const loadingAnim = document.querySelector(".loadingAnim");

beforeBtn.addEventListener("click", function (e) {
  loadingPage.style.opacity = "0";
  loadingPage.style.zIndex = "-1";
  canvas.style.display = "block";
});

const loadingManager = new THREE.LoadingManager(
  //loaded
  () => {
    beforeBtn.style.opacity = "1";
    beforeBtn.style.zIndex = "11";
    loadingBar.style.opacity = "0";
    loadingBarC.style.opacity = "0";
  },
  //progress
  (Url, itemsLoaded, itemsTotal) => {
    loadingBar.style.width = (itemsLoaded / itemsTotal) * 98 + "%";
  }
);

const loader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

//scene
const scene = new THREE.Scene(loadingManager);
scene.background = new THREE.Color(backgroundColor);
// scene.fog = new THREE.Fog(backgroundColor, 60, 100);

//size
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
// renderer.outputEncoding = THREEsRGBEncoding;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;

document.body.appendChild(renderer.domElement);

//camera
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.z = 11;
camera.position.x = 0;
camera.position.y = 0;
scene.add(camera);

//lights
let ambientLight = new THREE.AmbientLight("white", 3);
ambientLight.position.set(0, 10, 0);
scene.add(ambientLight);

const d = 8.25;
const directLight = new THREE.DirectionalLight("white", 3.5);
directLight.position.set(-8, 12, 8);
// directLight.castShadow = true;
// directLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
// directLight.shadow.camera.near = 0.1;
// directLight.shadow.camera.far = 1500;
// directLight.shadow.camera.left = d * -1;
// directLight.shadow.camera.right = d;
// directLight.shadow.camera.top = d;
// directLight.shadow.camera.bottom = d * -1;
// directLight.shadow.normalBias = 0.05;
scene.add(directLight);

//enmap
const environMap = cubeTextureLoader.load([
  "/envMaps/px.jpg",
  "/envMaps/nx.jpg",
  "/envMaps/py.jpg",
  "/envMaps/ny.jpg",
  "/envMaps/pz.jpg",
  "/envMaps/nz.jpg",
]);

//Model
let model, mixer, neck, waist;

//box
const geometry = new THREE.BoxGeometry(2, 8, 2);
const material = new THREE.MeshStandardMaterial({
  visible: false,
});
const cube = new THREE.Mesh(geometry, material);
if (sizes.width > 1000) {
  scene.add(cube);
}

//gltf model
function loadeded(modelPath) {
  loader.load(modelPath, (gltf) => {
    model = gltf.scene;
    let fileAnimations = gltf.animations;
    model.traverse((o) => {
      // console.log(o);
      if (o.isBone && o.name === "mixamorigNeck") {
        neck = o;
      }
      if (o.isBone && o.name === "mixamorigSpine") {
        waist = o;
      }
      if (o.isMesh) {
        o.material.envMap = environMap;
        o.material.envMapIntensity = 3;
      }
    });

    //Mixer;
    mixer = new THREE.AnimationMixer(model);
    let idleAnim = THREE.AnimationClip.findByName(fileAnimations, "idle");
    idleAnim.tracks.splice(3, 3);
    idleAnim.tracks.splice(9, 3);
    let idle = mixer.clipAction(idleAnim);
    idle.play();

    model.position.y = -4;
    model.scale.set(2.1, 2.1, 2.1);

    scene.add(model);
    loadingAnim.style.opacity = 0;
  });
}

let modelT = "/models/c1.glb";

loadeded(modelT);

//raycaster

document.addEventListener("dblclick", (e) => raycast(e, changedModelC));
// document.addEventListener("mouseover", (e) => raycast(e, mouseEnterModel));
// document.addEventListener("mouseout", (e) => raycast(e, mouseLeaveModel));
mobileControls.addEventListener("dblclick", (e) => changeModel(e));

// document.addEventListener("touchend", (e) => raycast(e, true));

function raycast(e, func) {
  e.preventDefault();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    func();
  }
}

// function mouseEnterModel() {
//   doubleClick.classList.add("show");
// }
// function mouseLeaveModel() {
//   doubleClick.classList.remove("show");
// }

function changedModelC() {
  if (modelT === "/models/c1.glb") {
    scene.remove(model);
    scene.remove(cube);
    modelT = "/models/c2.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
    scene.add(cube);
  } else if (modelT === "/models/c2.glb") {
    scene.remove(cube);
    scene.remove(model);
    modelT = "/models/c3.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
    scene.add(cube);
  } else if (modelT === "/models/c3.glb") {
    scene.remove(cube);
    scene.remove(model);
    modelT = "/models/c4.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
    scene.add(cube);
  } else if (modelT === "/models/c4.glb") {
    scene.remove(cube);
    scene.remove(model);
    modelT = "/models/c1.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
    scene.add(cube);
  }
}

function changeModel(e) {
  e.preventDefault;
  if (modelT === "/models/c1.glb") {
    scene.remove(model);
    modelT = "/models/c2.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
  } else if (modelT === "/models/c2.glb") {
    scene.remove(model);
    modelT = "/models/c3.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
  } else if (modelT === "/models/c3.glb") {
    scene.remove(model);
    modelT = "/models/c4.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
  } else if (modelT === "/models/c4.glb") {
    scene.remove(model);
    modelT = "/models/c1.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
  }
}

//Cursor
function getMousePos(e) {
  return { x: e.clientX, y: e.clientY };
}
function getMousePosMobile(e) {
  return {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY,
  };
}
function moveJoint(mouse, joint, degreeLimit, width, height) {
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit, width, height);
  joint.rotation.y = THREE.Math.degToRad(degrees.x);
  joint.rotation.x = THREE.Math.degToRad(degrees.y);
}
function getMouseDegrees(x, y, degreeLimit, width, height) {
  let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage;

  let w = { x: width, y: height };

  if (x <= w.x / 2) {
    xdiff = w.x / 2 - x;
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = ((degreeLimit * xPercentage) / 100) * -1;
  }
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2;
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = ((degreeLimit * 0.5 * yPercentage) / 100) * -1;
  }

  if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (degreeLimit * yPercentage) / 100;
  }
  return { x: dx, y: dy };
}

document.addEventListener("mousemove", function (e) {
  const mousecoords = getMousePos(e);

  if (neck && waist) {
    moveJoint(mousecoords, neck, 50, sizes.width, sizes.height);
    moveJoint(mousecoords, waist, 40, sizes.width, sizes.height);
  }
});

mobileControls.addEventListener("touchmove", function (e) {
  e.preventDefault();
  const mousecoords = getMousePosMobile(e);
  if (neck && waist) {
    moveJoint(mousecoords, neck, 50, sizes.width * 1.2, sizes.height * 1.2);
    moveJoint(mousecoords, waist, 40, sizes.width * 1.2, sizes.height * 1.2);
  }
});

// function setTranslate(xPos, yPos, el) {
//   el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
// }

//resize
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// controls;
const controls = new OrbitControls(camera, canvas);
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 2;
// controls.target = new THREE.Vector3(-10, 0, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false; // Toggle this if you'd like the chair to
controls.autoRotateSpeed = 0.2;

//animation
let previousTime = 0;
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if (mixer) {
    mixer.update(deltaTime);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
  // effectComposer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
