import { Planet } from "../elements/planet";
import { SphereConfig } from "../elements/sphere";

export class Pluto extends Planet {
    constructor(gl: WebGLRenderingContext) {
        const plutoConfig: SphereConfig = {
            radius: 0.2,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/pluto_texture.jpg'
        };
        super(gl, plutoConfig, 35.5, 0.0005);
    }
}
