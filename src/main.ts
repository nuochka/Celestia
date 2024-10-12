import { StarField, StarFieldConfig } from "./elements/stars";

const canvas = document.getElementById("solar-system") as HTMLCanvasElement;
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    throw new Error("WebGL not supported");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

//Star field configuration
const starConfig: StarFieldConfig = {
    numStars: 1000,
    fieldOfView: 45,
    aspect: canvas.width / canvas.height,
    zNear: 0.1,
    zFar: 100.0
}

const starField = new StarField(gl, starConfig);

// Camera settings
let cameraAngleX = 0;
let cameraAngleY = 0;
const cameraDistance= 1.5;
let lastMouseX = 0;
let lastMouseY = 0;
let isMouseDown = false;

canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

canvas.addEventListener('mouseup', (event) => {
    isMouseDown = false;
});

canvas.addEventListener('mousemove', (event) => {
    if(isMouseDown) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;

        cameraAngleY += deltaX * 0.01;
        cameraAngleX -= deltaY * 0.01;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

function animate() {
    starField.render(cameraAngleX, cameraAngleY, cameraDistance);
    requestAnimationFrame(animate);
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
animate();
