import { Sphere, SphereConfig } from "../elements/sphere";
import { OrbitField } from "./orbit";

export abstract class Planet {
    protected gl: WebGLRenderingContext;
    protected sphere: Sphere;
    protected orbit: OrbitField;

    protected orbitRadius: number;
    protected angle: number = 0;
    protected orbitSpeed: number;

    protected rotationAngle: number = 0;
    protected rotationSpeed: number;

    private isOrbitVisible: boolean = true;

    constructor(gl: WebGLRenderingContext, config: SphereConfig, orbitRadius: number, orbitSpeed: number, rotationSpeed: number, orbitColor: [number, number, number, number]) {
        this.gl = gl;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.rotationSpeed = rotationSpeed;

        this.sphere = new Sphere(gl, config);
        this.sphere.loadTexture(config.textureUrl);

        this.orbit = new OrbitField(gl, {
            radius: orbitRadius,
            color: orbitColor,
            fieldOfView: config.fieldOfView,
            aspect: config.aspect,
            zNear: config.zNear,
            zFar: config.zFar
        });
    }

    // Method to toggle the visibility of the planet's orbit
    public toggleOrbitVisibility(): void {
        this.isOrbitVisible = !this.isOrbitVisible;
        this.orbit.setVisible(this.isOrbitVisible);
        const orbitButton = document.getElementById("toggleOrbitButton") as HTMLButtonElement;
        if (orbitButton) {
            orbitButton.textContent = this.isOrbitVisible ? "Hide Orbit" : "Show Orbit";
        }
    }
    

    // Update method to adjust the planet's angle and rotation based on time scaling
    public update(scale: number) {
        this.angle = (this.angle + this.orbitSpeed * scale) % (2 * Math.PI);
        this.rotationAngle = (this.rotationAngle + this.rotationSpeed * scale) % (2 * Math.PI);
    }

    // Render method
    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        this.orbit.render(cameraAngleX, cameraAngleY, cameraDistance);
        const x = this.orbitRadius * Math.cos(this.angle);
        const y = 0;
        const z = this.orbitRadius * Math.sin(this.angle);
    
        // Calculate light direction from Sun to Planet
        const lightDirection = new Float32Array([x - 0, y - 0, z - 0]);
    
        // Normalize light direction vector
        const length = Math.sqrt(lightDirection[0] * lightDirection[0] +
            lightDirection[1] * lightDirection[1] +
            lightDirection[2] * lightDirection[2]);
        lightDirection[0] /= length;
        lightDirection[1] /= length;
        lightDirection[2] /= length;


        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z, this.rotationAngle, this.orbitSpeed, lightDirection, false);
    }
}
