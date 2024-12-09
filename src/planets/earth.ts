import { SphereConfig, Sphere } from "../elements/sphere";
import { Planet } from "../elements/planet";
import { Moon } from "../elements/moon";

export class Earth extends Planet{

    constructor(gl: WebGLRenderingContext) {
        const earthConfig: SphereConfig = {
            radius: 0.6,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/earth_texture.jpg'
        };
        super(gl, earthConfig, 8.0, 0.0027, 0.005, [0.8, 0.8, 0.6, 1.0]);
    }
}

export class EarthSphere extends Sphere{
    private orbitRadius: number = 0.0001;
    private angle: number = 0;
    private angularSpeed: number = 0;

    constructor(gl: WebGLRenderingContext) {
        const earthConfig: SphereConfig = {
            radius: 0.6,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/earth_texture.jpg'
        };
        super(gl, earthConfig);

        const moonConfig: SphereConfig = {
            radius: 0.2,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/moons/moon_texture.jpg'
        };

        const moon = new Moon(gl, moonConfig, 2.5, 0.01, 0.002);
        this.addMoon(moon);
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        this.angle += this.angularSpeed;
        const x = this.orbitRadius * Math.cos(this.angle);
        const y = 0;
        const z = this.orbitRadius * Math.sin(this.angle);
        const lightDirection = new Float32Array([-x, -y, -z]);

        const length = Math.sqrt(lightDirection[0] ** 2 + lightDirection[1] ** 2 + lightDirection[2] ** 2);
        lightDirection[0] /= length;
        lightDirection[1] /= length;
        lightDirection[2] /= length;

        super.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z, this.angle, 0, lightDirection, false);
    }
}
