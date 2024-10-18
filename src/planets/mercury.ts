import { Sphere, SphereConfig } from "../elements/sphere";
import { mat4 } from 'gl-matrix';

export class Mercury {
    private gl: WebGLRenderingContext;
    private sphere: Sphere;

    // Mercury orbit parameters
    private mercuryOrbitRadius: number = 2.5; 
    private mercuryAngle: number = 0;         
    private mercuryOrbitSpeed: number = 0.01;

    constructor(gl: WebGLRenderingContext) {
        const mercuryConfig: SphereConfig = {
            radius: 0.3,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/mercury_texture.jpg'
        };

        this.gl = gl;
        this.sphere = new Sphere(gl, mercuryConfig);
        this.sphere.loadTexture(mercuryConfig.textureUrl);
    }

    public update() {
        this.mercuryAngle += this.mercuryOrbitSpeed;
        if (this.mercuryAngle >= 2 * Math.PI) {
            this.mercuryAngle -= 2 * Math.PI;
        }
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const mercuryX = this.mercuryOrbitRadius * Math.cos(this.mercuryAngle);
        const mercuryY = 0;
        const mercuryZ = this.mercuryOrbitRadius * Math.sin(this.mercuryAngle);

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, mercuryX, mercuryY, mercuryZ);
    }
    
}
