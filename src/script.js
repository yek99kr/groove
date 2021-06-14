import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { NoToneMapping } from "three";

const canvas = document.querySelector("#c");
const before = document.querySelector(".before");
const mobileControls = document.querySelector(".mobileControls");
const beforeBtn = document.querySelector(".before-enterBtn");
const button1 = document.querySelector(".button1");
const button2 = document.querySelector(".button2");
const button3 = document.querySelector(".button3");
const after = document.querySelector(".after");
const backgroundColor = "white";
const loadingAnim = document.querySelector(".loadingAnim");
const background = document.querySelector(".background");
const cursor = document.querySelector(".cursor");

let musiccounter = 2;

var music = document.createElement("audio");
music.setAttribute("src", `/html/music1.mp3`);
music.setAttribute("loop", "loop");

button1.addEventListener("click", function (e) {
  music.setAttribute("src", `/html/music${musiccounter}.mp3`);
  music.play();

  musiccounter++;
  if (musiccounter > 7) {
    musiccounter = 1;
  }
});

before.addEventListener("click", function (e) {
  music.play();
  before.style.opacity = "0";
  before.style.zIndex = "-1";
  canvas.style.display = "block";
  after.style.opacity = "1";
});

const loadingManager = new THREE.LoadingManager();

const loader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
const TextureLoader = new THREE.TextureLoader();

//scene
const scene = new THREE.Scene(loadingManager);
const back2 = TextureLoader.load("/html/back3.png");
scene.background = null;
// scene.background = new THREE.Color(backgroundColor);
// scene.fog = new THREE.Fog(backgroundColor, 60, 100);

//size
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
// renderer.outputEncoding = THREEsRGBEncoding;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setClearColor(0x000000, 0);
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
        o.material.toneMapped = true;
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
mobileControls.addEventListener("dblclick", (e) => changeModel(e));

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
    modelT = "/models/c5.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
    scene.add(cube);
  } else if (modelT === "/models/c5.glb") {
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
    modelT = "/models/c5.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
  } else if (modelT === "/models/c5.glb") {
    scene.remove(model);
    modelT = "/models/c1.glb";
    loadingAnim.style.opacity = 1;
    loadeded(modelT);
  }
}

let counter = 1;
//Background
button2.addEventListener("click", function () {
  background.src = `/html/back${counter}.png`;
  cursor.src = `/html/cursor${counter}.png`;
  counter++;
  if (counter >= 6) {
    counter = 0;
  }
});

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

  cursor.style.top = e.clientY + "px";
  cursor.style.left = e.clientX + "px";

  if (neck && waist) {
    moveJoint(mousecoords, neck, 50, sizes.width, sizes.height);
    moveJoint(mousecoords, waist, 40, sizes.width, sizes.height);
  }
});
const mobileControls2 = document.querySelector(".mobileControls2");
mobileControls.addEventListener("touchmove", function (e) {
  e.preventDefault();
  mobileControls2.style.display = "none";
  const mousecoords = getMousePosMobile(e);
  if (neck && waist) {
    moveJoint(mousecoords, neck, 50, sizes.width * 1.2, sizes.height * 1.2);
    moveJoint(mousecoords, waist, 40, sizes.width * 1.2, sizes.height * 1.2);
  }
});
mobileControls.addEventListener("touchend", function (e) {
  mobileControls2.style.display = "block";
});

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

const one = document.querySelector(".one");
const three = document.querySelector(".three");
const five = document.querySelector(".five");
const six = document.querySelector(".six");
const eight = document.querySelector(".eight");
const ten = document.querySelector(".ten");
const twelve = document.querySelector(".twelve");

const G1 = document.querySelector(".G1");
const G2 = document.querySelector(".G2");
const o11 = document.querySelector(".o11");
const o21 = document.querySelector(".o21");
const o12 = document.querySelector(".o12");
const o22 = document.querySelector(".o22");
const V1 = document.querySelector(".V1");
const V2 = document.querySelector(".V2");
const e11 = document.querySelector(".e11");
const e21 = document.querySelector(".e21");
const e12 = document.querySelector(".e12");
const e22 = document.querySelector(".e22");
const I1 = document.querySelector(".I1");
const I2 = document.querySelector(".I2");
const H1 = document.querySelector(".H1");
const H2 = document.querySelector(".H2");
var sound = document.createElement("audio");

function enter(one, two, three) {
  three.addEventListener("mouseenter", function (e) {
    one.style.opacity = "0";
    two.style.opacity = "1";
  });
  three.addEventListener("mouseleave", function (e) {
    one.style.opacity = "1";
    two.style.opacity = "0";
  });
}
enter(G1, G2, one);
enter(o11, o21, three);
// enter(o12, o22, four);
enter(V1, V2, five);
enter(e11, e21, six);
enter(e12, e22, twelve);

enter(I1, I2, eight);
enter(H1, H2, ten);
