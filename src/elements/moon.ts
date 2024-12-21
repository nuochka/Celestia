import { Sphere, SphereConfig } from "../elements/sphere";
import { OrbitField } from "../elements/orbit";

export class Moon {
    private gl: WebGLRenderingContext;
    private sphere: Sphere;
    private orbitField: OrbitField;

    private orbitRadius: number;
    private orbitSpeed: number;
    private rotationSpeed: number;

    private angle: number = 0;
    private rotationAngle: number = 0;

    constructor(gl: WebGLRenderingContext, config: SphereConfig, orbitRadius: number, orbitSpeed: number, rotationSpeed: number) {
        this.gl = gl;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.rotationSpeed = rotationSpeed;

        this.sphere = new Sphere(gl, config);
        this.sphere.loadTexture(config.textureUrl);

        this.orbitField = new OrbitField(gl, {
            radius: orbitRadius,
            color: [0.68, 0.85, 0.90, 1.0],
            fieldOfView: config.fieldOfView,
            aspect: config.aspect,
            zNear: config.zNear,
            zFar: config.zFar,
        });
    }

    public setMoonSpeeds(orbitSpeed: number, rotationSpeed: number): void {
        this.orbitSpeed = -orbitSpeed;
        this.rotationSpeed = -rotationSpeed;
    }

    public update(scale: number): void {
        this.angle = (this.angle + this.orbitSpeed * scale) % (2 * Math.PI);
        this.rotationAngle = (this.rotationAngle + this.rotationSpeed * scale) % (2 * Math.PI);
    }

    public render(parentX: number, parentY: number, parentZ: number, cameraAngleX: number, cameraAngleY: number, cameraDistance: number): void {
        const x = parentX + this.orbitRadius * Math.cos(this.angle);
        const y = parentY;
        const z = parentZ + this.orbitRadius * Math.sin(this.angle);

        const lightDirection = new Float32Array([x - parentX, y - parentY, z - parentZ]);
        const length = Math.sqrt(lightDirection[0] ** 2 + lightDirection[1] ** 2 + lightDirection[2] ** 2);
        lightDirection[0] /= length;
        lightDirection[1] /= length;
        lightDirection[2] /= length;

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z, this.rotationAngle, this.orbitSpeed, lightDirection, false);

        this.orbitField.render(cameraAngleX, cameraAngleY, cameraDistance);
    }

    public setOrbitVisible(visible: boolean): void {
        this.orbitField.setVisible(visible);
    }
}
