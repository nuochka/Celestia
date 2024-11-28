import { StarField, StarFieldConfig } from "./elements/stars";
import { GridField, SubgridField, GridFieldConfig, SubgridFieldConfig } from "./elements/gridfield";
import { Sun } from "./elements/sun";
import { Mercury } from "./planets/mercury";
import { Venus } from "./planets/venus";
import { Earth } from "./planets/earth";
import { Mars } from "./planets/mars";
import { Jupiter } from "./planets/jupiter";
import { Saturn, saturnConfig } from "./planets/saturn";
import { Uranus, uranusConfig } from "./planets/uranus";
import { Neptune } from "./planets/neptune";
import { Pluto } from "./planets/pluto";
import { AsteroidBelt } from "./elements/asteroidBelt";
import { Ring } from "./elements/ring";

const canvas = document.getElementById("solar-system") as HTMLCanvasElement;
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    throw new Error("WebGL not supported");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

// Star field configuration
const starConfig: StarFieldConfig = {
    numStars: 2000,
    fieldOfView: 40,
    aspect: canvas.width / canvas.height,
    zNear: 1,
    zFar: 1000.0
};

const gridFieldConfig: GridFieldConfig = {
    size: 100, 
    gridColor:[0.5, 0.5, 0.5, 0.7],
    fieldOfView: 45,
    aspect: canvas.width / canvas.height,
    zNear: 0.1,
    zFar: 1000,
};

const subgridConfig: SubgridFieldConfig = {
    size: 500,                 
    gridColor: [0.5, 0.5, 0.5, 1],  
    subgridColor: [0.8, 0.8, 0.8, 0.0], 
    fieldOfView: 45,
    aspect: canvas.width / canvas.height,
    zNear: 0.1,
    zFar: 100,
    subgridSize: 10, 
};

const gridField = new GridField(gl, gridFieldConfig);
const subgridField = new SubgridField(gl, subgridConfig);
const starField = new StarField(gl, starConfig);
const sun = new Sun(gl);
const mercury = new Mercury(gl);
const venus = new Venus(gl);
const earth = new Earth(gl);
const mars = new Mars(gl);
const jupiter = new Jupiter(gl);
const saturn = new Saturn(gl);
const uranus = new Uranus(gl);
const neptune = new Neptune(gl);
const pluto = new Pluto(gl);

const asteroidBelt = new AsteroidBelt(gl, 300, 10, 13.5);
const kuiperBelt = new AsteroidBelt(gl, 6000, 56, 100);

const saturnRing = new Ring(gl, 1.0, 2.5, 100, 'http://127.0.0.1:8080/textures/saturn_ring.png', saturnConfig.fieldOfView, saturnConfig.aspect, saturnConfig.zNear, saturnConfig.zFar, 0.001, 0.002, 22.0);
const uranusRing = new Ring(gl, 1.0, 1.5, 100, 'http://127.0.0.1:8080/textures/uranus_ring.jpg', uranusConfig.fieldOfView, uranusConfig.aspect, uranusConfig.zNear, uranusConfig.zFar, 0.0005, 0.0004, 40.0, 0, 0, true);

let cameraAngleX = 0;
let cameraAngleY = 0;
let cameraDistance = 2;
const minCameraDistance = 1.0;
const maxCameraDistance = 200.0;
let lastMouseX = 0;
let lastMouseY = 0;
let isMouseDown = false;

canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;

        cameraAngleY += deltaX * 0.01;
        cameraAngleX -= deltaY * 0.01;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    cameraDistance += event.deltaY * 0.005;
    cameraDistance = Math.max(minCameraDistance, Math.min(maxCameraDistance, cameraDistance));
});

let paused = false;

const toggleButton = document.getElementById('toggle-motion');
if (toggleButton) {
    toggleButton.addEventListener('click', () => {
        paused = !paused;
        toggleButton.textContent = paused ? 'Resume' : 'Pause';
    });
} else {
    console.error('Toggle button not found');
}

function updateScene() {
    if (!paused) {
        saturnRing.update();
        uranusRing.update();
        sun.update();
        mercury.update();
        venus.update();
        earth.update();
        mars.update();
        jupiter.update();
        saturn.update(); 
        uranus.update();
        neptune.update();
        pluto.update();
        asteroidBelt.update(-0.1);
        kuiperBelt.update(-0.003);
    }

}

function renderScene() {
    if (!gl) return;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.depthMask(false);
    starField.render(cameraAngleX, cameraAngleY, 1);

    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.depthMask(true);

    sun.render(cameraAngleX, cameraAngleY, cameraDistance);
    mercury.render(cameraAngleX, cameraAngleY, cameraDistance);
    venus.render(cameraAngleX, cameraAngleY, cameraDistance);
    earth.render(cameraAngleX, cameraAngleY, cameraDistance);
    mars.render(cameraAngleX, cameraAngleY, cameraDistance);
    jupiter.render(cameraAngleX, cameraAngleY, cameraDistance);
    saturn.render(cameraAngleX, cameraAngleY, cameraDistance);
    uranus.render(cameraAngleX, cameraAngleY, cameraDistance);
    neptune.render(cameraAngleX, cameraAngleY, cameraDistance);
    pluto.render(cameraAngleX, cameraAngleY, cameraDistance);

    gridField.render(cameraAngleX, cameraAngleY);
    subgridField.render(cameraAngleX, cameraAngleY);

    asteroidBelt.render(cameraAngleX, cameraAngleY, cameraDistance);
    kuiperBelt.render(cameraAngleX, cameraAngleY, cameraDistance);

    saturnRing.render(cameraAngleX, cameraAngleY, cameraDistance);
    uranusRing.render(cameraAngleX, cameraAngleY, cameraDistance);
}

function animate() {
    updateScene();
    renderScene();
    requestAnimationFrame(animate);
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
animate();