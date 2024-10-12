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

function animate() {
    starField.render();
    requestAnimationFrame(animate);
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
animate();
