import { Planet } from "../elements/planet";
import { Sphere } from "../elements/sphere";


export const saturnConfig = {
    radius: 1.2,
    latitudeBands: 30,
    longitudeBands: 30,
    fieldOfView: 50,
    aspect: window.innerWidth / window.innerHeight,
    zNear: 0.1,
    zFar: 1000.0,
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

export class SaturnSphere extends Sphere{
    private orbitRadius: number = 0.0001;
    private angle: number = 0;
    private angularSpeed: number = 0;

    constructor(
        gl: WebGLRenderingContext
    ) {
        super(gl, saturnSphereConfig)
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