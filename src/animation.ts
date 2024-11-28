let paused = false;
export let cameraAngleX = 0;
export let cameraAngleY = 0;
export let cameraDistance = 2;
export const minCameraDistance = 1.0;
export const maxCameraDistance = 200.0;
let lastMouseX = 0;
let lastMouseY = 0;
let isMouseDown = false;

export function setupEventListeners(canvas: HTMLCanvasElement) {
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
}

export function togglePause(toggleButton: HTMLElement) {
    toggleButton.addEventListener('click', () => {
        paused = !paused;
        toggleButton.textContent = paused ? 'Resume' : 'Pause';
    });
}

export function updateScene(objects: any) {
    if (!paused) {
        objects.saturnRing.update();
        objects.uranusRing.update();
        objects.sun.update();
        objects.mercury.update();
        objects.venus.update();
        objects.earth.update();
        objects.mars.update();
        objects.jupiter.update();
        objects.saturn.update();
        objects.uranus.update();
        objects.neptune.update();
        objects.pluto.update();
        objects.asteroidBelt.update(-0.1);
        objects.kuiperBelt.update(-0.003);
    }
}

export function renderScene(gl: WebGLRenderingContext, objects: any, cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.depthMask(false);
    objects.starField.render(cameraAngleX, cameraAngleY, 1);

    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.depthMask(true);

    objects.sun.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.mercury.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.venus.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.earth.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.mars.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.jupiter.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.saturn.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.uranus.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.neptune.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.pluto.render(cameraAngleX, cameraAngleY, cameraDistance);

    objects.gridField.render(cameraAngleX, cameraAngleY);
    objects.subgridField.render(cameraAngleX, cameraAngleY);

    objects.asteroidBelt.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.kuiperBelt.render(cameraAngleX, cameraAngleY, cameraDistance);

    objects.saturnRing.render(cameraAngleX, cameraAngleY, cameraDistance);
    objects.uranusRing.render(cameraAngleX, cameraAngleY, cameraDistance);
}
