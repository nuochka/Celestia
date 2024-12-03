import { Planet } from "../elements/planet";
import { SphereConfig, Sphere } from "../elements/sphere";

export class Neptune extends Planet{

    constructor(gl: WebGLRenderingContext) {
        const neptuneConfig: SphereConfig = {
            radius: 0.75,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/neptune_texture.jpg'
        };
        super(gl, neptuneConfig, 50.0, -0.00008, 0.0005, [0.8, 0.8, 0.6, 1.0]);
    }
}

export class NeptuneSphere extends Sphere{

    constructor(gl: WebGLRenderingContext) {
        const neptuneConfig: SphereConfig = {
            radius: 0.6,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/neptune_texture.jpg'
        };
        super(gl, neptuneConfig);
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const lightDirection = new Float32Array([1.0, 1.0, 1.0]); 
        super.render(cameraAngleX, cameraAngleY, cameraDistance, 0, 0, 0, 0, 0, lightDirection, false);
    }
}

