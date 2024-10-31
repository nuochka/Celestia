import { Planet } from "../elements/planet";
import { SphereConfig } from "../elements/sphere";

export class Saturn extends Planet{
    constructor(gl: WebGLRenderingContext) {
        const saturnConfig: SphereConfig = {
            radius: 1, 
            latitudeBands: 40,
            longitudeBands: 40,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/saturn_texture.jpg'
        };
        super(gl, saturnConfig, 30.0, 0.002);
    }
}
