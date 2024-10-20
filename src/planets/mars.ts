import { Sphere, SphereConfig } from "../elements/sphere";
import { mat4 } from 'gl-matrix';

export class Mars {
    private gl: WebGLRenderingContext;
    private sphere: Sphere;

    // Mars orbit parameters
    private marsOrbitRadius: number = 8.5;  
    private marsAngle: number = 0;
    private marsOrbitSpeed: number = 0.0019; 

    constructor(gl: WebGLRenderingContext) {
        const marsConfig: SphereConfig = {
            radius: 0.4,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/mars_texture.jpg'
        };

        this.gl = gl;
        this.sphere = new Sphere(gl, marsConfig);
        this.sphere.loadTexture(marsConfig.textureUrl);
    }

    public update() {
        this.marsAngle += this.marsOrbitSpeed;
        if (this.marsAngle >= 2 * Math.PI) {
            this.marsAngle -= 2 * Math.PI;
        }
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const marsX = this.marsOrbitRadius * Math.cos(this.marsAngle);
        const marsY = 0;
        const marsZ = this.marsOrbitRadius * Math.sin(this.marsAngle);

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, marsX, marsY, marsZ);
    }
}
