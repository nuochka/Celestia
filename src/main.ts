import { StarField, StarFieldConfig } from "./elements/stars";
import { Sphere, SphereConfig } from "./elements/sphere";

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

const starField = new StarField(gl, starConfig);

// Sun configuration
const sunConfig: SphereConfig = {
    radius: 1,
    latitudeBands: 30,
    longitudeBands: 30,
    fieldOfView: 100,
    aspect: canvas.width / canvas.height,
    zNear: 0.1,
    zFar: 100.0,
    textureUrl: 'http://127.0.0.1:8080/textures/sun_texture.png'
};

const sun = new Sphere(gl, sunConfig);
sun.loadTexture('http://127.0.0.1:8080/textures/sun_texture.png');

let cameraAngleX = 0;
let cameraAngleY = 0;
let cameraDistance = 2; 
const minCameraDistance = 0.5; 
const maxCameraDistance = 10.0;
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
        sun.render(cameraAngleX, cameraAngleY, cameraDistance);
        starField.render(cameraAngleX, cameraAngleY, 1);
    }
    requestAnimationFrame(animate);
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
animate();
