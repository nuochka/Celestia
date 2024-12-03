import { SphereConfig, Sphere } from "../elements/sphere";
import { Planet } from "../elements/planet";

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
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const lightDirection = new Float32Array([1.0, 1.0, 1.0]); 
        super.render(cameraAngleX, cameraAngleY, cameraDistance, 0, 0, 0, 0, 0, lightDirection, false);
    }
}
