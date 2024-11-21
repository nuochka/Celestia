import { Planet } from "../elements/planet";
import { SphereConfig } from "../elements/sphere";

export class Pluto extends Planet {
    constructor(gl: WebGLRenderingContext) {
        const plutoConfig: SphereConfig = {
            radius: 0.2,
            latitudeBands: 20,
            longitudeBands: 20,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/pluto_texture.jpg'
        };
        super(gl, plutoConfig, 60.0, -0.0002, 0.00001, [0.8, 0.8, 0.6, 1.0]);
    }
}
