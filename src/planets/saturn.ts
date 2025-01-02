import { Planet } from "../elements/planet";
import { Sphere, SphereConfig } from "../elements/sphere";
import { Ring } from "../elements/ring";
import { Moon } from "../elements/moon";


export const saturnConfig = {
    radius: 1.2,
    latitudeBands: 30,
    longitudeBands: 30,
    fieldOfView: 50,
    aspect: window.innerWidth / window.innerHeight,
    zNear: 0.1,
    zFar: 500.0,
    textureUrl: 'http://127.0.0.1:8080/textures/saturn_texture.jpg'
};

export class Saturn extends Planet {
    constructor(
        gl: WebGLRenderingContext
    ) {  
        super(gl, saturnConfig, 22.0, -0.002, 0.001, [0.8, 0.8, 0.6, 1.0]);
    }
}

const saturnSphereConfig = {
    ...saturnConfig,
    radius: 0.6
};

export class SaturnSphere extends Sphere {
    private orbitRadius: number = 0.0001;
    private angle: number = 0;
    private angularSpeed: number = 0.005;
    private ring: Ring;
    private paused: boolean = false;

    constructor(gl: WebGLRenderingContext) {
        super(gl, saturnSphereConfig);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.ring = new Ring(
            gl,
            0.8,
            1.8,
            100,
            'http://127.0.0.1:8080/textures/saturn_ring.png',
            saturnConfig.fieldOfView,
            saturnConfig.aspect,
            saturnConfig.zNear,
            saturnConfig.zFar,
            0.001,
            0.002,
            this.orbitRadius
        );

        this.createAndAddMoon(gl, 3.0, 0.015, 'http://127.0.0.1:8080/textures/moons/mimas_texture.jpg');
        this.createAndAddMoon(gl, 4.0, 0.014, 'http://127.0.0.1:8080/textures/moons/enceladus_texture.jpg');
        this.createAndAddMoon(gl, 5.0, 0.013, 'http://127.0.0.1:8080/textures/moons/tethys_texture.jpg');
        this.createAndAddMoon(gl, 6.5, 0.012, 'http://127.0.0.1:8080/textures/moons/dione_texture.jpg');
        this.createAndAddMoon(gl, 8.0, 0.010, 'http://127.0.0.1:8080/textures/moons/rhea_texture.jpg');
        this.createAndAddMoon(gl, 11.5, 0.005, 'http://127.0.0.1:8080/textures/moons/titan_texture.jpg');
        this.createAndAddMoon(gl, 13.5, 0.003, 'http://127.0.0.1:8080/textures/moons/hyperion_texture.jpg');
    }

    private createAndAddMoon(gl: WebGLRenderingContext, orbitRadius: number, orbitalSpeed: number, textureUrl: string) {
        const moonConfig: SphereConfig = {
            radius: 0.15,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: textureUrl
        };

        const moon = new Moon(gl, moonConfig, orbitRadius, orbitalSpeed, 0.001);
        super.addMoon(moon);
    }

    setSaturnSpeeds(orbitSpeed: number, rotationSpeed: number) {
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
        this.ring.render(cameraAngleX, cameraAngleY, cameraDistance);

        if (!this.paused) {
            this.moons.forEach(moon => {
                moon.update(1);
                moon.render(x, y, z, cameraAngleX, cameraAngleY, cameraDistance);
            });
        }
    }
}