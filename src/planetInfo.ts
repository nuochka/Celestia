import { MercurySphere } from './planets/mercury';
import { VenusSphere } from './planets/venus';
import { EarthSphere } from './planets/earth';
import { MarsSphere } from './planets/mars';
import { JupiterSphere } from './planets/jupiter';
import { SaturnSphere } from './planets/saturn';
import { UranusSphere } from './planets/uranus';
import { NeptuneSphere } from './planets/neptune';
import { PlutoSphere } from './planets/pluto';
import { StarField, StarFieldConfig } from './elements/stars';

interface MoonInfo {
    name: string;
    description: string;
    diameter: string;
    distanceFromPlanet: string;
    surface: string;
    composition: string;
    temperature: string;
  }

interface PlanetInfo {
    name: string;
    description: string;
    diameter: string;
    distanceFromSun: string;
    moons: number;
    atmosphere: string;
    surface: string;
    temperature: string;
    composition: string;
    
    equatorialDiameter: string;
    mass: string;
    meanDistanceFromSun: string;
    rotationPeriod: string;
    orbitalPeriod: string;
    surfaceGravity: string;
    surfaceTemperature: string;
    detailedSurface: string;

    moonsInfo: MoonInfo[];
}

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('solar-system') as HTMLCanvasElement;
    const starConfig: StarFieldConfig = {
        numStars: 2000,
        fieldOfView: 40,
        aspect: canvas.width / canvas.height,
        zNear: 1,
        zFar: 1000.0
    };

    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }

    const gl = canvas.getContext("webgl");
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

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
    let minCameraDistance = 2.5;
    let maxCameraDistance = 20;

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

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        cameraDistance += event.deltaY * 0.005;
        cameraDistance = Math.max(minCameraDistance, Math.min(maxCameraDistance, cameraDistance));
    });

    let currentPlanet: any = null;
    const planetSwitchers: { [key: string]: any } = {
        mercury: new MercurySphere(gl),
        venus: new VenusSphere(gl),
        earth: new EarthSphere(gl),
        mars: new MarsSphere(gl),
        jupiter: new JupiterSphere(gl),
        saturn: new SaturnSphere(gl),
        uranus: new UranusSphere(gl),
        neptune: new NeptuneSphere(gl),
        pluto: new PlutoSphere(gl)
    };

    const planetInfoData: { [key: string]: PlanetInfo } = {
        mercury: {
            name: "Mercury",
            description: "The closest planet to the Sun. Mercury has a very thin atmosphere, and its surface experiences extreme temperature variations.",
            diameter: "4,880 km",
            distanceFromSun: "57.91 million km",
            moons: 0,
            atmosphere: "Very thin atmosphere, mostly oxygen, sodium, hydrogen, helium, and potassium",
            surface: "Cratered, rocky surface",
            temperature: "Day: 430°C, Night: -180°C",
            composition: "Rocky, metallic core",
            equatorialDiameter: "4,880 km",
            mass: "3.3011 × 10^23 kg",
            meanDistanceFromSun: "57.91 million km",
            rotationPeriod: "58.6 Earth days",
            orbitalPeriod: "88 Earth days",
            surfaceGravity: "3.7 m/s²",
            surfaceTemperature: "Day: 430°C, Night: -180°C",
            detailedSurface: "Mercury's surface is covered with impact craters, similar to the Moon. It lacks a significant atmosphere, which means there is no weathering or erosion.",
            moonsInfo: []
        },
        venus: {
            name: "Venus",
            description: "The second planet from the Sun. Venus has a thick atmosphere full of carbon dioxide, which creates a strong greenhouse effect.",
            diameter: "12,104 km",
            distanceFromSun: "108.2 million km",
            moons: 0,
            atmosphere: "Thick atmosphere of carbon dioxide, with clouds of sulfuric acid",
            surface: "Volcanic plains, mountains, and craters",
            temperature: "467°C (constant)",
            composition: "Rocky, thick atmosphere",
            equatorialDiameter: "12,104 km",
            mass: "4.867 × 10^24 kg",
            meanDistanceFromSun: "108.2 million km",
            rotationPeriod: "243 Earth days (retrograde rotation)",
            orbitalPeriod: "225 Earth days",
            surfaceGravity: "8.87 m/s²",
            surfaceTemperature: "467°C (constant)",
            detailedSurface: "Venus' surface is rocky, with large volcanic plains and impact craters. Due to the thick cloud cover, it's almost impossible to see the surface directly from space.",
            moonsInfo: []
        },
        earth: {
            name: "Earth",
            description: "The third planet from the Sun and the only one known to support life. Earth has a diverse climate and geography.",
            diameter: "12,742 km",
            distanceFromSun: "149.6 million km",
            moons: 1,
            atmosphere: "Nitrogen, oxygen, argon, carbon dioxide",
            surface: "70% water, 30% land (mountains, oceans, deserts, forests)",
            temperature: "Average: 15°C",
            composition: "Rocky, liquid water",
            equatorialDiameter: "12,742 km",
            mass: "5.972 × 10^24 kg",
            meanDistanceFromSun: "149.6 million km",
            rotationPeriod: "24 hours",
            orbitalPeriod: "365.25 days",
            surfaceGravity: "9.81 m/s²",
            surfaceTemperature: "Average: 15°C",
            detailedSurface: "Earth has diverse landscapes, including oceans, mountains, deserts, forests, and tundra. It is the only planet known to support life, thanks to liquid water and a stable climate.",
            moonsInfo: [
                {
                    name: "Moon",
                    description: "Earth's only natural satellite. The Moon influences Earth’s tides and stabilizes its axial tilt.",
                    diameter: "3,474.8 km",
                    distanceFromPlanet: "384,400 km",
                    surface: "Rocky surface with maria (dark plains) and highlands",
                    composition: "Rocky, with a small iron core",
                    temperature: "Day: 127°C, Night: -173°C"
                }
            ]
        },
        mars: {
            name: "Mars",
            description: "The fourth planet from the Sun, known for its red appearance. Mars is the most explored planet after Earth, with many robotic missions sent to its surface.",
            diameter: "6,779 km",
            distanceFromSun: "227.9 million km",
            moons: 2,
            atmosphere: "Thin atmosphere, mostly carbon dioxide with traces of nitrogen and argon",
            surface: "Red, rocky surface with dust storms and large volcanoes",
            temperature: "Average: -60°C",
            composition: "Rocky, iron oxide surface",
            equatorialDiameter: "6,779 km",
            mass: "6.4171 × 10^23 kg",
            meanDistanceFromSun: "227.9 million km",
            rotationPeriod: "24.6 hours",
            orbitalPeriod: "687 Earth days",
            surfaceGravity: "3.71 m/s²",
            surfaceTemperature: "Average: -60°C",
            detailedSurface: "Mars has a dry, rocky surface with large dust storms, volcanoes like Olympus Mons (the largest volcano in the solar system), and the Valles Marineris canyon system.",
            moonsInfo: [
                {
                    name: "Phobos",
                    description: "Mars' larger moon, Phobos, is slowly spiraling inward towards the planet and is expected to eventually crash into Mars or break apart.",
                    diameter: "22.4 km",
                    distanceFromPlanet: "9,377 km",
                    surface: "Rocky, heavily cratered surface",
                    composition: "Rocky with some ice",
                    temperature: "Day: -4°C, Night: -112°C"
                },
                {
                    name: "Deimos",
                    description: "The smaller of Mars' two moons. Deimos is a tiny moon that orbits Mars in a nearly circular path.",
                    diameter: "12.4 km",
                    distanceFromPlanet: "23,460 km",
                    surface: "Rocky surface with small craters",
                    composition: "Rocky, with low density",
                    temperature: "Day: -5°C, Night: -125°C"
                }
            ]
        },
        jupiter: {
            name: "Jupiter",
            description: "The largest planet in the Solar System. Jupiter is a gas giant, mainly made up of hydrogen and helium.",
            diameter: "139,820 km",
            distanceFromSun: "778.3 million km",
            moons: 79,
            atmosphere: "Thick atmosphere of hydrogen and helium, with traces of methane and ammonia",
            surface: "No solid surface, gas layers and storm systems (Great Red Spot)",
            temperature: "Average: -108°C",
            composition: "Gas giant, hydrogen and helium",
            equatorialDiameter: "139,820 km",
            mass: "1.898 × 10^27 kg",
            meanDistanceFromSun: "778.3 million km",
            rotationPeriod: "9.9 hours",
            orbitalPeriod: "11.86 Earth years",
            surfaceGravity: "24.79 m/s²",
            surfaceTemperature: "Average: -108°C",
            detailedSurface: "Jupiter does not have a solid surface. Its atmosphere is mostly hydrogen and helium, and its lower layers are composed of metallic hydrogen and other gases. It has violent storms, including the Great Red Spot.",
            moonsInfo: [
                {
                    name: "Io",
                    description: "Io is the most volcanically active body in the Solar System, with hundreds of volcanoes, some of which erupt with lava fountains.",
                    diameter: "3,643.2 km",
                    distanceFromPlanet: "421,700 km",
                    surface: "Volcanic surface with active volcanoes",
                    composition: "Rocky, with a sulfur-rich surface",
                    temperature: "Day: 130°C, Night: -143°C"
                },
                {
                    name: "Europa",
                    description: "Europa is covered in ice and likely has an ocean beneath its icy crust. It is one of the best candidates for finding life beyond Earth.",
                    diameter: "3,121.6 km",
                    distanceFromPlanet: "670,900 km",
                    surface: "Smooth, icy surface with cracks",
                    composition: "Icy, rocky core",
                    temperature: "Day: -160°C, Night: -220°C"
                },
                {
                    name: "Ganymede",
                    description: "Ganymede is the largest moon in the Solar System and has its own magnetic field.",
                    diameter: "5,268 km",
                    distanceFromPlanet: "1,070,400 km",
                    surface: "Rocky, icy surface with grooves and ridges",
                    composition: "Icy, rocky",
                    temperature: "Day: -100°C, Night: -160°C"
                },
                {
                    name: "Callisto",
                    description: "Callisto is heavily cratered, and its surface is made of a mixture of rock and water ice.",
                    diameter: "4,820.6 km",
                    distanceFromPlanet: "1,882,700 km",
                    surface: "Icy surface with craters",
                    composition: "Rocky and icy",
                    temperature: "Day: -139°C, Night: -193°C"
                }
            ]
        },
        saturn: {
            name: "Saturn",
            description: "Known for its large ring system, Saturn is a gas giant made up mostly of hydrogen and helium.",
            diameter: "116,460 km",
            distanceFromSun: "1.43 billion km",
            moons: 82,
            atmosphere: "Mainly hydrogen and helium with trace amounts of methane, ammonia, and water vapor",
            surface: "No solid surface, gas layers and ring system",
            temperature: "Average: -139°C",
            composition: "Gas giant, hydrogen and helium",
            equatorialDiameter: "116,460 km",
            mass: "5.683 × 10^26 kg",
            meanDistanceFromSun: "1.43 billion km",
            rotationPeriod: "10.7 hours",
            orbitalPeriod: "29.5 Earth years",
            surfaceGravity: "10.44 m/s²",
            surfaceTemperature: "Average: -139°C",
            detailedSurface: "Saturn's surface is made up of thick layers of gas, and there is no solid ground. The planet has a well-known ring system made of ice and rock particles.",
            moonsInfo: [
                {
                    name: "Mimas",
                    description: "Mimas is the smallest of Saturn's moons with a noticeable crater named Herschel. It is often compared to the Death Star due to its appearance.",
                    diameter: "396 km",
                    distanceFromPlanet: "185,000 km",
                    surface: "Icy surface with a large crater",
                    composition: "Icy",
                    temperature: "-201°C"
                },
                {
                    name: "Enceladus",
                    description: "Enceladus is a moon that has geysers ejecting water vapor from its surface, indicating the presence of an underground ocean.",
                    diameter: "504 km",
                    distanceFromPlanet: "238,000 km",
                    surface: "Icy surface with cryovolcanic activity",
                    composition: "Icy",
                    temperature: "-201°C"
                },
                {
                    name: "Tethys",
                    description: "Tethys is a large icy moon of Saturn, known for its large impact crater, Odysseus, and a huge valley named Ithaca Chasma.",
                    diameter: "1,062 km",
                    distanceFromPlanet: "294,660 km",
                    surface: "Icy surface with craters and valleys",
                    composition: "Icy",
                    temperature: "-220°C"
                },
                {
                    name: "Dione",
                    description: "Dione is an icy moon of Saturn that has both bright, icy terrain and older, heavily cratered regions. It shows signs of tectonic activity.",
                    diameter: "1,123 km",
                    distanceFromPlanet: "377,400 km",
                    surface: "Icy surface with craters and fractures",
                    composition: "Icy",
                    temperature: "-195°C"
                },
                {
                    name: "Rhea",
                    description: "Rhea is Saturn's second-largest moon. It has a heavily cratered surface and is made mostly of water ice with a small rocky core.",
                    diameter: "1,527 km",
                    distanceFromPlanet: "527,000 km",
                    surface: "Icy surface with craters",
                    composition: "Icy and rocky",
                    temperature: "-217°C"
                },
                {
                    name: "Titan",
                    description: "Titan is Saturn's largest moon and the second-largest moon in the Solar System. It has a thick atmosphere and surface lakes of liquid methane.",
                    diameter: "5,151.8 km",
                    distanceFromPlanet: "1,222,000 km",
                    surface: "Rocky and icy surface with methane lakes",
                    composition: "Icy, rocky",
                    temperature: "Day: -179°C, Night: -289°C"
                },
                {
                    name: "Hyperion",
                    description: "Hyperion is an irregularly shaped moon with a sponge-like appearance. It has an unstable rotation and is one of Saturn's smaller moons.",
                    diameter: "270 km",
                    distanceFromPlanet: "1,482,000 km",
                    surface: "Porous surface with a spongy texture",
                    composition: "Icy, rocky",
                    temperature: "-220°C"
                }
            ]
        },
        uranus: {
            name: "Uranus",
            description: "The ice giant with a tilted axis. Uranus has a unique retrograde rotation, spinning in the opposite direction of most planets.",
            diameter: "50,724 km",
            distanceFromSun: "2.87 billion km",
            moons: 27,
            atmosphere: "Mostly hydrogen, helium, and methane",
            surface: "No solid surface, icy and gaseous layers",
            temperature: "Average: -197°C",
            composition: "Ice giant, methane and ammonia",
            equatorialDiameter: "50,724 km",
            mass: "8.681 × 10^25 kg",
            meanDistanceFromSun: "2.87 billion km",
            rotationPeriod: "17.24 hours",
            orbitalPeriod: "84 Earth years",
            surfaceGravity: "8.69 m/s²",
            surfaceTemperature: "Average: -197°C",
            detailedSurface: "Uranus does not have a solid surface, and its icy and gaseous layers are composed mostly of water, ammonia, and methane. It is a cold planet with strong winds and extreme seasons.",
            moonsInfo: [
                {
                    name: "Puck",
                    description: "Puck is one of Uranus' smaller moons. It has a heavily cratered surface and is thought to be a captured asteroid. Its irregular shape and small size distinguish it from the larger moons of Uranus.",
                    diameter: "162.4 km",
                    distanceFromPlanet: "151,500 km",
                    surface: "Heavily cratered and irregular",
                    composition: "Icy, rocky",
                    temperature: "-223°C"
                },
                {
                    name: "Miranda",
                    description: "Miranda is the smallest and innermost of Uranus' five major moons. It has a diverse surface with valleys, ridges, and large fault canyons.",
                    diameter: "471.6 km",
                    distanceFromPlanet: "129,000 km",
                    surface: "Icy and rocky surface with canyons and cliffs",
                    composition: "Icy, rocky",
                    temperature: "-197°C"
                },
                {
                    name: "Ariel",
                    description: "Ariel is one of Uranus' largest moons, known for its bright surface and many craters, valleys, and ridges. It is believed to have had a geologically active past.",
                    diameter: "1,158.8 km",
                    distanceFromPlanet: "191,000 km",
                    surface: "Icy surface with extensive rift valleys and craters",
                    composition: "Icy, rocky",
                    temperature: "-224°C"
                },
                {
                    name: "Umbriel",
                    description: "Umbriel is one of Uranus' larger moons, with a dark surface that is heavily cratered. It has a less active surface compared to Ariel.",
                    diameter: "1,170 km",
                    distanceFromPlanet: "266,000 km",
                    surface: "Dark, heavily cratered surface",
                    composition: "Icy, rocky",
                    temperature: "-224°C"
                },
                {
                    name: "Titania",
                    description: "Titania is Uranus' largest moon. It has a surface covered by a mixture of ice and rock with large canyons and ancient craters.",
                    diameter: "1,578.8 km",
                    distanceFromPlanet: "436,000 km",
                    surface: "Icy surface with canyons and large craters",
                    composition: "Icy, rocky",
                    temperature: "-224°C"
                },
                {
                    name: "Oberon",
                    description: "Oberon is Uranus' second-largest moon and is known for its large craters and its icy and rocky surface. It has a heavily cratered surface and is thought to have a small amount of internal heat.",
                    diameter: "1,523.4 km",
                    distanceFromPlanet: "583,500 km",
                    surface: "Icy surface with large craters",
                    composition: "Icy, rocky",
                    temperature: "-224°C"
                }
            ]
        },
        neptune: {
            name: "Neptune",
            description: "The eighth and farthest planet from the Sun. Neptune is known for its intense blue color and strong winds.",
            diameter: "49,244 km",
            distanceFromSun: "4.5 billion km",
            moons: 14,
            atmosphere: "Mainly hydrogen, helium, and methane",
            surface: "No solid surface, icy and gaseous layers",
            temperature: "Average: -214°C",
            composition: "Ice giant, methane atmosphere",
            equatorialDiameter: "49,244 km",
            mass: "1.024 × 10^26 kg",
            meanDistanceFromSun: "4.5 billion km",
            rotationPeriod: "16.1 hours",
            orbitalPeriod: "164.8 Earth years",
            surfaceGravity: "11.15 m/s²",
            surfaceTemperature: "Average: -214°C",
            detailedSurface: "Neptune has no solid surface, and its atmosphere consists mostly of hydrogen, helium, and methane. It has very strong winds and a turbulent atmosphere.",
            moonsInfo: [
                {
                    name: "Triton",
                    description: "Triton is Neptune’s largest moon and has geysers that eject nitrogen gas. It has a retrograde orbit, which suggests it was captured by Neptune's gravity.",
                    diameter: "2,710 km",
                    distanceFromPlanet: "354,800 km",
                    surface: "Icy surface with geysers",
                    composition: "Icy, rocky core",
                    temperature: "Day: -235°C, Night: -235°C"
                }
            ]
        },
        pluto: {
            name: "Pluto",
            description: "A dwarf planet located in the Kuiper belt. Once considered the ninth planet, Pluto was reclassified as a dwarf planet in 2006.",
            diameter: "2,377 km",
            distanceFromSun: "5.9 billion km",
            moons: 5,
            atmosphere: "Thin atmosphere of nitrogen, methane, and carbon monoxide",
            surface: "Icy, with mountains, plains, and craters",
            temperature: "Average: -229°C",
            composition: "Rocky core with a mantle of water ice",

            equatorialDiameter: "2,377 km",
            mass: "1.309 × 10^22 kg",
            meanDistanceFromSun: "5.9 billion km",
            rotationPeriod: "6.39 Earth days",
            orbitalPeriod: "248 Earth years",
            surfaceGravity: "0.62 m/s²",
            surfaceTemperature: "Average: -229°C",
            detailedSurface: "Pluto's surface is composed of nitrogen and methane ice, with vast plains and mountain ranges. It has an unusual heart-shaped glacier known as Sputnik Planitia. The surface features are diverse and complex, showing evidence of past geological activity.", 
            moonsInfo: []
        }
    };    
    function switchPlanet(planetName: string) {
        if (planetSwitchers[planetName]) {
            currentPlanet = planetSwitchers[planetName];
            updatePlanetInfo(planetName);
            render();
        }
    }


    function updatePlanetInfo(planetName: string) {
        const planetInfo = planetInfoData[planetName];
        const infoContent = document.getElementById("planet-info-content") as HTMLElement;
    
        if (planetInfo) {
            infoContent.innerHTML = `
                <h2>${planetInfo.name}</h2>
                <p><strong>Description:</strong> ${planetInfo.description}</p>
                <p><strong>Diameter:</strong> ${planetInfo.diameter}</p>
                <p><strong>Equatorial Diameter:</strong> ${planetInfo.equatorialDiameter}</p>
                <p><strong>Mass:</strong> ${planetInfo.mass}</p>
                <p><strong>Mean Distance from Sun:</strong> ${planetInfo.meanDistanceFromSun}</p>
                <p><strong>Rotation Period:</strong> ${planetInfo.rotationPeriod}</p>
                <p><strong>Orbital Period:</strong> ${planetInfo.orbitalPeriod}</p>
                <p><strong>Surface Gravity:</strong> ${planetInfo.surfaceGravity}</p>
                <p><strong>Surface Temperature:</strong> ${planetInfo.surfaceTemperature}</p>
                <p><strong>Atmosphere:</strong> ${planetInfo.atmosphere}</p>
                <p><strong>Surface:</strong> ${planetInfo.surface}</p>
                <p><strong>Detailed Surface:</strong> ${planetInfo.detailedSurface}</p>
                <p><strong>Composition:</strong> ${planetInfo.composition}</p>
                <h3>Moons:</h3>
                ${planetInfo.moonsInfo && planetInfo.moonsInfo.length > 0 
                    ? planetInfo.moonsInfo.map(moon => `
                        <br><strong>${moon.name}</strong>: ${moon.description}
                        <br><strong>Diameter:</strong> ${moon.diameter}
                        <br><strong>Distance from Planet:</strong> ${moon.distanceFromPlanet}
                        <br><strong>Surface:</strong> ${moon.surface}
                        <br><strong>Composition:</strong> ${moon.composition}
                        <br><strong>Temperature:</strong> ${moon.temperature}
                        <br><br>
                    `).join('')
                    : '<p>No moons</p>'}
            `;
        } else {
            infoContent.innerHTML = `<p>Information not available</p>`;
        }
    }    

    const starField = new StarField(gl, starConfig);

    function render() {
        if (!gl) return;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.depthMask(false);
        starField.render(cameraAngleX, cameraAngleY, 1);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.depthMask(true);
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
                event.preventDefault();
                switchPlanet(planet);
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

    const sidebar = document.getElementById("planet-info-sidebar") as HTMLElement;
    const toggleSidebarButton = document.getElementById("toggle-sidebar-button") as HTMLButtonElement;

    toggleSidebarButton.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");

        if (sidebar.classList.contains("collapsed")) {
            toggleSidebarButton.style.left = "0";
        } else {
            toggleSidebarButton.style.left = "442px";
        }
    });

    let paused = false;
    const toggleButton = document.getElementById("toggle-motion-planet") as HTMLButtonElement;

    toggleButton.addEventListener('click', () => {
        paused = !paused;
        toggleButton.textContent = paused ? 'Resume' : 'Pause';

        if (currentPlanet && currentPlanet instanceof SaturnSphere) {
            currentPlanet.togglePause();
        }
        if (currentPlanet && currentPlanet instanceof EarthSphere) {
            currentPlanet.togglePause();
        }
        if (currentPlanet && currentPlanet instanceof JupiterSphere) {
            currentPlanet.togglePause();
        }
        if (currentPlanet && currentPlanet instanceof UranusSphere) {
            currentPlanet.togglePause();
        }
        if (currentPlanet && currentPlanet instanceof NeptuneSphere) {
            currentPlanet.togglePause();
        }
        if(currentPlanet && currentPlanet instanceof MarsSphere){
            currentPlanet.togglePause();
        }
    });
    
});
