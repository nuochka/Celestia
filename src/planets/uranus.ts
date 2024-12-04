import { Planet } from "../elements/planet";
import { Sphere } from "../elements/sphere"

export  const uranusConfig = {
    radius: 0.8,
    latitudeBands: 30,
    longitudeBands: 30,
    fieldOfView: 50,
    aspect: window.innerWidth / window.innerHeight,
    zNear: 0.1,
    zFar: 1000.0,
    textureUrl: 'http://127.0.0.1:8080/textures/uranus_texture.png'
};

export class Uranus extends Planet {
    constructor(
        gl: WebGLRenderingContext
    ) {
        super(gl, uranusConfig, 40.0, -0.0004, 0.0005, [0.8, 0.8, 0.6, 1.0]);
    }
}

const uranusSphereConfig = {
    ...uranusConfig,
    radius: 0.6
};


export class UranusSphere extends Sphere {
    private orbitRadius: number = 0.0001;
    private angle: number = 0;
    private angularSpeed: number = 0;
    
    constructor(
        gl: WebGLRenderingContext
    ) {
        super(gl, uranusSphereConfig);
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