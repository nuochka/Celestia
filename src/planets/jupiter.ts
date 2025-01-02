import { Planet } from "../elements/planet";
import { SphereConfig, Sphere } from "../elements/sphere";
import { Moon } from "../elements/moon";

export class Jupiter extends Planet {

    constructor(gl: WebGLRenderingContext) {
        const jupiterConfig: SphereConfig = {
            radius: 1.5, 
            latitudeBands: 40,
            longitudeBands: 40,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/jupiter_texture.jpg' 
        };
        super(gl, jupiterConfig, 18.0, 0.001, 0.005, [0.8, 0.8, 0.6, 1.0]);
    }
}

export class JupiterSphere extends Sphere {
    private orbitRadius: number = 0.0001; 
    private angle: number = 0;
    private angularSpeed: number = 0.005;
    private paused: boolean = false;

    constructor(gl: WebGLRenderingContext) {

        const jupiterConfig: SphereConfig = {
            radius: 1.5,
            latitudeBands: 40,
            longitudeBands: 40,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/jupiter_texture.jpg' 
        };
        super(gl, jupiterConfig);
        this.createAndAddMoon(gl, 2.5, 0.020, 'http://127.0.0.1:8080/textures/moons/io_texture.jpg');
        this.createAndAddMoon(gl, 4.5, 0.015, 'http://127.0.0.1:8080/textures/moons/europa_texture.jpg');
        this.createAndAddMoon(gl, 6.5, 0.005, 'http://127.0.0.1:8080/textures/moons/ganymede_texture.jpg');
        this.createAndAddMoon(gl, 8.5, 0.003, 'http://127.0.0.1:8080/textures/moons/callisto_texture.jpg');
    }

    private createAndAddMoon(gl: WebGLRenderingContext, orbitRadius: number, orbitalSpeed: number, textureUrl: string) {
        const moonConfig: SphereConfig = {
            radius: 0.2,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: textureUrl
        };

        const moon = new Moon(gl, moonConfig, orbitRadius, orbitalSpeed, 0.001);  
        this.addMoon(moon);
    }

    setJupiterSpeeds(orbitSpeed: number, rotationSpeed: number) {
        this.angularSpeed = orbitSpeed;

        this.moons.forEach(moon => {
            moon.setMoonSpeeds(this.angularSpeed * 0.5, rotationSpeed * 0.5);
        });
    }

    togglePause() {
        this.paused = !this.paused;
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        if (!this.paused) {
            this.angle += this.angularSpeed;
        }

        const x = this.orbitRadius * Math.cos(this.angle);
        const y = 0;
        const z = this.orbitRadius * Math.sin(this.angle);
        const lightDirection = new Float32Array([-x, -y, -z]);

        const length = Math.sqrt(lightDirection[0] ** 2 + lightDirection[1] ** 2 + lightDirection[2] ** 2);
        lightDirection[0] /= length;
        lightDirection[1] /= length;
        lightDirection[2] /= length;

        super.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z, this.angle, 0, lightDirection, false);

        if (!this.paused) {
            this.moons.forEach(moon => {
                moon.update(1);
                moon.render(x, y, z, cameraAngleX, cameraAngleY, cameraDistance);
            });
        }
    }
}

