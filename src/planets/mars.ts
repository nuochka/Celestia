import { Planet } from "../elements/planet";
import { SphereConfig } from "../elements/sphere";

export class Mars extends Planet{

    constructor(gl: WebGLRenderingContext) {
        const marsConfig: SphereConfig = {
            radius: 0.35,
            latitudeBands: 20,
            longitudeBands: 20,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/mars_texture.jpg'
        };
        super(gl, marsConfig, 10.0, 0.0019, 0.005);
    }
}
