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

export function initializeScene(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
    const starConfig: StarFieldConfig = {
        numStars: 2000,
        fieldOfView: 40,
        aspect: canvas.width / canvas.height,
        zNear: 1,
        zFar: 1000.0
    };

    const gridFieldConfig: GridFieldConfig = {
        size: 100, 
        gridColor: [0.5, 0.5, 0.5, 0.7],
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

    return {
        gridField,
        subgridField,
        starField,
        sun,
        mercury,
        venus,
        earth,
        mars,
        jupiter,
        saturn,
        uranus,
        neptune,
        pluto,
        asteroidBelt,
        kuiperBelt,
        saturnRing,
        uranusRing
    };
}
