import { Sphere, SphereConfig } from "../elements/sphere";
import { mat4 } from 'gl-matrix';

export class Jupiter {
    private gl: WebGLRenderingContext;
    private sphere: Sphere;

    // Jupiter orbit parameters
    private jupiterOrbitRadius: number = 13.0; 
    private jupiterAngle: number = 0;
    private jupiterOrbitSpeed: number = 0.001;

    constructor(gl: WebGLRenderingContext) {
        const jupiterConfig: SphereConfig = {
            radius: 1.5, 
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/jupiter_texture.jpg' 
        };

        this.gl = gl;
        this.sphere = new Sphere(gl, jupiterConfig);
        this.sphere.loadTexture(jupiterConfig.textureUrl);
    }

    public update() {
        this.jupiterAngle += this.jupiterOrbitSpeed;
        if (this.jupiterAngle >= 2 * Math.PI) {
            this.jupiterAngle -= 2 * Math.PI;
        }
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const jupiterX = this.jupiterOrbitRadius * Math.cos(this.jupiterAngle);
        const jupiterY = 0;
        const jupiterZ = this.jupiterOrbitRadius * Math.sin(this.jupiterAngle);

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, jupiterX, jupiterY, jupiterZ);
    }
}
