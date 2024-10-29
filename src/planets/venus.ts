import { SphereConfig } from "../elements/sphere";
import { Planet } from "../elements/planet";

export class Venus extends Planet {

    constructor(gl: WebGLRenderingContext) {
        const venusConfig: SphereConfig = {
            radius: 0.6,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/venus_texture.jpg'
        };
        super(gl, venusConfig, 4.5, 0.005);
    }
}
