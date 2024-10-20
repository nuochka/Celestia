import { Sphere, SphereConfig } from "../elements/sphere";
import { mat4 } from 'gl-matrix';

export class Venus {
    private gl: WebGLRenderingContext;
    private sphere: Sphere;

    // Venus orbit parameters
    private venusOrbitRadius: number = 4.5;
    private venusAngle: number = 0;          
    private venusOrbitSpeed: number = 0.005;

    constructor(gl: WebGLRenderingContext) {
        const venusConfig: SphereConfig = {
            radius: 0.6,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/venus_texture.jpg'
        };

        this.gl = gl;
        this.sphere = new Sphere(gl, venusConfig);
        this.sphere.loadTexture(venusConfig.textureUrl);
    }

    public update() {
        this.venusAngle += this.venusOrbitSpeed;
        if (this.venusAngle >= 2 * Math.PI) {
            this.venusAngle -= 2 * Math.PI;
        }
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const venusX = this.venusOrbitRadius * Math.cos(this.venusAngle);
        const venusY = 0;
        const venusZ = this.venusOrbitRadius * Math.sin(this.venusAngle);

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, venusX, venusY, venusZ);
    }
}
