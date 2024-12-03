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
    constructor(
        gl: WebGLRenderingContext
    ) {
        super(gl, saturnSphereConfig)
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const lightDirection = new Float32Array([1.0, 1.0, 1.0]); 
        super.render(cameraAngleX, cameraAngleY, cameraDistance, 0, 0, 0, 0, 0, lightDirection, false);
    }
}