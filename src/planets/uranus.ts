import { Sphere, SphereConfig } from "../elements/sphere";
import { mat4 } from 'gl-matrix';

export class Uranus {
    private gl: WebGLRenderingContext;
    private sphere: Sphere;

    // Uranus orbit parameters
    private uranusOrbitRadius: number = 20.5; 
    private uranusAngle: number = 0;
    private uranusOrbitSpeed: number = 0.0004;

    constructor(gl: WebGLRenderingContext) {
        const uranusConfig: SphereConfig = {
            radius: 0.8, 
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/uranus_texture.png'
        };

        this.gl = gl;
        this.sphere = new Sphere(gl, uranusConfig);
        this.sphere.loadTexture(uranusConfig.textureUrl);
    }

    public update() {
        this.uranusAngle += this.uranusOrbitSpeed;
        if (this.uranusAngle >= 2 * Math.PI) {
            this.uranusAngle -= 2 * Math.PI;
        }
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const uranusX = this.uranusOrbitRadius * Math.cos(this.uranusAngle);
        const uranusY = 0;
        const uranusZ = this.uranusOrbitRadius * Math.sin(this.uranusAngle);

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, uranusX, uranusY, uranusZ);
    }
}