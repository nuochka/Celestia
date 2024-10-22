import { Sphere, SphereConfig } from "../elements/sphere";
import { mat4 } from 'gl-matrix';

export class Neptune {
    private gl: WebGLRenderingContext;
    private sphere: Sphere;

    // Neptune orbit parameters
    private neptuneOrbitRadius: number = 30.1;
    private neptuneAngle: number = 0;
    private neptuneOrbitSpeed: number = 0.0008;

    constructor(gl: WebGLRenderingContext) {
        const neptuneConfig: SphereConfig = {
            radius: 0.75,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/neptune_texture.jpg'
        };

        this.gl = gl;
        this.sphere = new Sphere(gl, neptuneConfig);
        this.sphere.loadTexture(neptuneConfig.textureUrl);
    }

    public update() {
        this.neptuneAngle += this.neptuneOrbitSpeed;
        if (this.neptuneAngle >= 2 * Math.PI) {
            this.neptuneAngle -= 2 * Math.PI;
        }
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const neptuneX = this.neptuneOrbitRadius * Math.cos(this.neptuneAngle);
        const neptuneY = 0;
        const neptuneZ = this.neptuneOrbitRadius * Math.sin(this.neptuneAngle);

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, neptuneX, neptuneY, neptuneZ);
    }
}
