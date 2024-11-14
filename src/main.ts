import { StarField, StarFieldConfig } from "./elements/stars";
import { GridField, SubgridField, GridFieldConfig, SubgridFieldConfig } from "./elements/gridfield";
import { Sun } from "./elements/sun";
import { Mercury } from "./planets/mercury";
import { Venus } from "./planets/venus";
import { Earth } from "./planets/earth";
import { Mars } from "./planets/mars";
import { Jupiter } from "./planets/jupiter";
import { Saturn } from "./planets/saturn";
import { Uranus } from "./planets/uranus";
import { Neptune } from "./planets/neptune";
import { Pluto } from "./planets/pluto";


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

let cameraAngleX = 0;
let cameraAngleY = 0;
let cameraDistance = 2;
const minCameraDistance = 1.0;
const maxCameraDistance = 50.0;
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
    cameraDistance += event.deltaY * 0.001;
    cameraDistance = Math.max(minCameraDistance, Math.min(maxCameraDistance, cameraDistance));
});

function animate() {
    if (gl) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(false);
        starField.render(cameraAngleX, cameraAngleY, 1);
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
    }
    requestAnimationFrame(animate);
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
animate();
