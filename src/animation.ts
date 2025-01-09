let paused = false;
export let cameraAngleX = 0;
export let cameraAngleY = 0;
export let cameraDistance = 20.0;
export const minCameraDistance = 20.0;
export const maxCameraDistance = 200.0;
let lastMouseX = 0;
let lastMouseY = 0;
let isMouseDown = false;

export function playSound(soundUrl: string) {
    const audio = new Audio(soundUrl);
    audio.play();
}

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
        playSound('http://127.0.0.1:8080/sounds/click.mp3');
        
        paused = !paused;
        toggleButton.textContent = paused ? 'Resume' : 'Pause';
    });
}

let scale = 1;
const scaleSlider = document.getElementById('scale-slider') as HTMLInputElement;
const scaleDisplay = document.getElementById('scale-display') as HTMLElement;

if (scaleSlider) {
    scaleSlider.addEventListener('input', () => {
        scale = parseFloat(scaleSlider.value);
        scaleDisplay.textContent = `Speed Scale: ${scale.toFixed(2)}`;
    });
} else {
    console.error('Scale slider not found');
}

const togglePlanetMenuButton = document.getElementById("togglePlanetMenuButton") as HTMLButtonElement;
const planetList = document.getElementById("planetList") as HTMLUListElement;

togglePlanetMenuButton.addEventListener("click", () => {
    playSound('http://127.0.0.1:8080/sounds/click_2.mp3');
    
    if (planetList.classList.contains("hidden")) {
        planetList.classList.remove("hidden");
        planetList.classList.add("expanded");
        togglePlanetMenuButton.textContent = "Hide Planets";
    } else {
        planetList.classList.remove("expanded");
        planetList.classList.add("hidden");
        togglePlanetMenuButton.textContent = "Show Planets";
    }
});

export function updateScene(objects: any) {
    if (!paused) {
        objects.saturnRing.update(scale);
        objects.uranusRing.update(scale);
        objects.sun.update(scale);
        objects.mercury.update(scale);
        objects.venus.update(scale);
        objects.earth.update(scale);
        objects.mars.update(scale);
        objects.jupiter.update(scale);
        objects.saturn.update(scale);
        objects.uranus.update(scale);
        objects.neptune.update(scale);
        objects.pluto.update(scale);
        objects.asteroidBelt.update(-0.1 * scale);
        objects.kuiperBelt.update(-0.003 * scale);
    }
}

let audio: HTMLAudioElement | null = null;

function playBackgroundSound(soundUrl: string) {
    if (audio && !audio.paused) return;

    audio = new Audio(soundUrl);
    audio.loop = true;
    audio.volume = 0.1;
    audio.muted = false;

    audio.play().catch((error) => {
        console.error("Error playing background sound:", error);
    });
}

function toggleMusic() {
    const button = document.getElementById('start-music') as HTMLButtonElement;

    if (audio) {
        playSound('http://127.0.0.1:8080/sounds/click.mp3');
        if (audio.paused) {
            audio.play().catch((error) => {
                console.error("Error starting background music:", error);
            });
            if (button) button.textContent = 'Stop Music';
            console.log('Music started');
        } else {
            audio.pause();
            if (button) button.textContent = 'Play Music';
        }
    }
}

window.addEventListener('load', () => {
    playBackgroundSound('http://127.0.0.1:8080/sounds/background.mp3');
});

document.getElementById('start-music')?.addEventListener('click', () => {
    toggleMusic();
});

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
