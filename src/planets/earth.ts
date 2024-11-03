import { SphereConfig } from "../elements/sphere";
import { Planet } from "../elements/planet";

export class Earth extends Planet{

    constructor(gl: WebGLRenderingContext) {
        const earthConfig: SphereConfig = {
            radius: 0.6,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/earth_texture.jpg'
        };
        super(gl, earthConfig, 8.0, 0.0027, 0.005);
    }
}
