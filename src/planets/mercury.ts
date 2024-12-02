import { Planet } from "../elements/planet";
import { SphereConfig, Sphere } from "../elements/sphere";

export class Mercury extends Planet {
    constructor(gl: WebGLRenderingContext) {
        const mercuryConfig: SphereConfig = {
            radius: 0.3,
            latitudeBands: 20,
            longitudeBands: 20,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/mercury_texture.jpg'
        };
        super(gl, mercuryConfig, 4.0, -0.01, 0.005, [0.8, 0.8, 0.6, 1.0]);
    }
}

export class MercurySphere extends Sphere {
    constructor(gl: WebGLRenderingContext) {
        const mercuryConfig: SphereConfig = {
            radius: 0.5,
            latitudeBands: 40,  
            longitudeBands: 40, 
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/mercury_texture.jpg'
        };
        super(gl, mercuryConfig);
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const lightDirection = new Float32Array([1.0, 1.0, 1.0]); 
        super.render(cameraAngleX, cameraAngleY, cameraDistance, 0, 0, 0, 0, 0, lightDirection, false);
    }
}
