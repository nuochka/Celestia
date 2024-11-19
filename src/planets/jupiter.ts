import { Planet } from "../elements/planet";
import { SphereConfig } from "../elements/sphere";

export class Jupiter extends Planet {

    constructor(gl: WebGLRenderingContext) {
        const jupiterConfig: SphereConfig = {
            radius: 1.5, 
            latitudeBands: 40,
            longitudeBands: 40,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/jupiter_texture.jpg' 
        };
        super(gl, jupiterConfig, 18.0, 0.001, 0.005, [0.8, 0.8, 0.6, 1.0]);
    }
}
