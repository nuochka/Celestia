import { Planet } from "../elements/planet";
import { SphereConfig, Sphere } from "../elements/sphere";

export class Pluto extends Planet {
    constructor(gl: WebGLRenderingContext) {
        const plutoConfig: SphereConfig = {
            radius: 0.2,
            latitudeBands: 20,
            longitudeBands: 20,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/pluto_texture.jpg'
        };
        super(gl, plutoConfig, 60.0, -0.0002, 0.00001, [0.8, 0.8, 0.6, 1.0]);
    }
}

export class PlutoSphere extends Sphere {
    private orbitRadius: number = 0.0001;
    private angle: number = 0;
    private angularSpeed: number = 0;
    
    constructor(gl: WebGLRenderingContext) {
        const plutoConfig: SphereConfig = {
            radius: 0.4,
            latitudeBands: 20,
            longitudeBands: 20,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/pluto_texture.jpg'
        };
        super(gl, plutoConfig);
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
