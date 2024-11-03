import { Planet } from "../elements/planet";
import { SphereConfig } from "../elements/sphere";

export class Mercury extends Planet {
    constructor(gl: WebGLRenderingContext) {
        const mercuryConfig: SphereConfig = {
            radius: 0.3,
            latitudeBands: 20,
            longitudeBands: 20,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/mercury_texture.jpg'
        };
        super(gl, mercuryConfig, 4.0, -0.01, 0.005);
    }
}
