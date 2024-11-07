import { Planet } from "../elements/planet";
import { SphereConfig } from "../elements/sphere";

export class Neptune extends Planet{

    constructor(gl: WebGLRenderingContext) {
        const neptuneConfig: SphereConfig = {
            radius: 0.75,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/neptune_texture.jpg'
        };
        super(gl, neptuneConfig, 50.0, -0.00008, 0.0005, [0.8, 0.8, 0.6, 1.0]);
    }
}
