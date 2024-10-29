import { Planet } from "../elements/planet";
import { SphereConfig } from "../elements/sphere";

export class Mars extends Planet{

    constructor(gl: WebGLRenderingContext) {
        const marsConfig: SphereConfig = {
            radius: 0.4,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/mars_texture.jpg'
        };
        super(gl, marsConfig, 8.5, 0.0019);
    }
}
