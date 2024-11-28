import { initializeScene } from './scene';
import { setupEventListeners, togglePause, updateScene, renderScene, cameraAngleX, cameraAngleY, cameraDistance } from './animation';

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

const sceneObjects = initializeScene(gl, canvas);

const toggleButton = document.getElementById('toggle-motion');
if (toggleButton) {
    togglePause(toggleButton);
} else {
    console.error('Toggle button not found');
}

setupEventListeners(canvas);

function animate() {
    if (!gl) return;
    updateScene(sceneObjects);
    renderScene(gl, sceneObjects, cameraAngleX, cameraAngleY, cameraDistance);
    requestAnimationFrame(animate);
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
animate();
