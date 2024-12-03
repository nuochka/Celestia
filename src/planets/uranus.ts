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
    constructor(
        gl: WebGLRenderingContext
    ) {
        super(gl, uranusSphereConfig);
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const lightDirection = new Float32Array([1.0, 1.0, 1.0]); 
        super.render(cameraAngleX, cameraAngleY, cameraDistance, 0, 0, 0, 0, 0, lightDirection, false);
    }
}