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

        super(gl, sunConfig, 0, 0, 0, [0, 0, 0, 0]);
    }
    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const x = 0;
        const y = 0;
        const z = 0;
    
        // For the sun, we set the light direction to be a fixed vector (Sun emits light in all directions)
        const lightDirection = new Float32Array([1.0, 1.0, 1.0]); // Sun light direction
        
        // Pass the light direction and make sure the Sun emits more light by adjusting the ambient light
        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z, 0, 0, lightDirection, true);
    }
    
}
