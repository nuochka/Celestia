import { Sphere, SphereConfig } from "../elements/sphere";
import { mat4 } from 'gl-matrix';

export class Pluto {
    private gl: WebGLRenderingContext;
    private sphere: Sphere;

    // Pluto orbit parameters
    private plutoOrbitRadius: number = 35.5;
    private plutoAngle: number = 0;
    private plutoOrbitSpeed: number = 0.0005;

    constructor(gl: WebGLRenderingContext) {
        const plutoConfig: SphereConfig = {
            radius: 0.2,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/pluto_texture.jpg'
        };

        this.gl = gl;
        this.sphere = new Sphere(gl, plutoConfig);
        this.sphere.loadTexture(plutoConfig.textureUrl);
    }

    public update() {
        this.plutoAngle += this.plutoOrbitSpeed;
        if (this.plutoAngle >= 2 * Math.PI) {
            this.plutoAngle -= 2 * Math.PI;
        }
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const plutoX = this.plutoOrbitRadius * Math.cos(this.plutoAngle);
        const plutoY = 0;
        const plutoZ = this.plutoOrbitRadius * Math.sin(this.plutoAngle);

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, plutoX, plutoY, plutoZ);
    }
}
