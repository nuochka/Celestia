import { Planet } from "../elements/planet";
import { SphereConfig } from "../elements/sphere";

export class Saturn extends Planet{
    constructor(gl: WebGLRenderingContext) {
        const saturnConfig: SphereConfig = {
            radius: 1.2, 
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/saturn_texture.jpg'
        };
        super(gl, saturnConfig, 22.0, -0.002, 0.001, [0.8, 0.8, 0.6, 1.0]);
    }
}
