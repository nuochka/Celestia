import { MercurySphere } from './planets/mercury';

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('solar-system') as HTMLCanvasElement;

    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }

    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    gl.clearColor(0.0, 0.0, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);

    function resizeCanvas() {
        if (!gl) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let cameraAngleX = 0;
    let cameraAngleY = 0;
    let cameraDistance = 2.5;

    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

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
            cameraAngleX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraAngleX));
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        }
    });

    let currentPlanet: any = null;
    const planetSwitchers: { [key: string]: any } = {
        mercury: new MercurySphere(gl),
    };
    const urlParams = new URLSearchParams(window.location.search);
    const planetParam = urlParams.get('planet');


    if (planetParam && planetSwitchers[planetParam]) {
        currentPlanet = planetSwitchers[planetParam];
    } else {
        currentPlanet = planetSwitchers['mercury'];
    }


    function switchPlanet(planetName: string) {
        if (planetSwitchers[planetName]) {
            currentPlanet = planetSwitchers[planetName];
            render();
        }
    }

    function render() {
        if (!gl) return;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (currentPlanet) {
            currentPlanet.render(cameraAngleX, cameraAngleY, cameraDistance);
        }
    }

    function animate() {
        render();
        requestAnimationFrame(animate);
    }

    animate();

    const planetLinks = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    planetLinks.forEach(planet => {
        const link = document.getElementById(planet) as HTMLAnchorElement;
        if (link) {
            link.addEventListener('click', (event) => {
                window.location.search = `?planet=${planet}`;
            });
        }
    });

    const togglePlanetMenuButton = document.getElementById("togglePlanetMenuButton") as HTMLButtonElement;
    const planetList = document.getElementById("planetList") as HTMLUListElement;

    togglePlanetMenuButton.addEventListener("click", () => {
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
});
