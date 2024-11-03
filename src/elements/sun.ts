import { Sphere, SphereConfig } from "../elements/sphere";
import { Planet } from "./planet";

export class Sun extends Planet {
    constructor(gl: WebGLRenderingContext) {
        const sunConfig: SphereConfig = {
            radius: 3.0,
            latitudeBands: 40,
            longitudeBands: 40,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/sun_texture.png'
        };

        super(gl, sunConfig, 0, 0, 0.001);
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const x = 0; 
        const y = 0; 
        const z = 0; 
        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z, this.rotationAngle);
    }
}
