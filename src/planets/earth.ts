import { Sphere, SphereConfig } from "../elements/sphere";
import { mat4 } from 'gl-matrix';

export class Earth {
    private gl: WebGLRenderingContext;
    private sphere: Sphere;

    // Earth orbit parameters
    private earthOrbitRadius: number = 6.5; 
    private earthAngle: number = 0;
    private earthOrbitSpeed: number = 0.0027;

    constructor(gl: WebGLRenderingContext) {
        const earthConfig: SphereConfig = {
            radius: 0.7,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/earth_texture.jpg'
        };

        this.gl = gl;
        this.sphere = new Sphere(gl, earthConfig);
        this.sphere.loadTexture(earthConfig.textureUrl);
    }

    public update() {
        this.earthAngle += this.earthOrbitSpeed;
        if (this.earthAngle >= 2 * Math.PI) {
            this.earthAngle -= 2 * Math.PI;
        }
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const earthX = this.earthOrbitRadius * Math.cos(this.earthAngle);
        const earthY = 0;
        const earthZ = this.earthOrbitRadius * Math.sin(this.earthAngle);

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, earthX, earthY, earthZ);
    }
}
