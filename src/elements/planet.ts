import { Sphere, SphereConfig } from "../elements/sphere";

export abstract class Planet {
    protected gl: WebGLRenderingContext;
    protected sphere: Sphere;

    protected orbitRadius: number; 
    protected angle: number = 0;         
    protected orbitSpeed: number; 

    constructor(gl: WebGLRenderingContext, config: SphereConfig, orbitRadius: number, orbitSpeed: number) {
        this.gl = gl;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;

        this.sphere = new Sphere(gl, config);
        this.sphere.loadTexture(config.textureUrl);
    }

    public update() {
        this.angle += this.orbitSpeed;
        if (this.angle >= 2 * Math.PI) {
            this.angle -= 2 * Math.PI;
        }
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const x = this.orbitRadius * Math.cos(this.angle);
        const y = 0;
        const z = this.orbitRadius * Math.sin(this.angle);

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z);
    }
}