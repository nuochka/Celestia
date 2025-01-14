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

    private isVerticalOrbit: boolean;
    constructor(gl: WebGLRenderingContext, config: SphereConfig, orbitRadius: number, orbitSpeed: number, rotationSpeed: number, isVerticalOrbit: boolean) {
        this.gl = gl;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.rotationSpeed = rotationSpeed;
        this.isVerticalOrbit = isVerticalOrbit;

        // Initialize the sphere that will represent the moon
        this.sphere = new Sphere(gl, config);
        this.sphere.loadTexture(config.textureUrl);

        // Initialize the orbit field that shows the orbit path
        this.orbitField = new OrbitField(gl, {
            radius: orbitRadius,
            color: [0.68, 0.85, 0.90, 1.0],
            fieldOfView: config.fieldOfView,
            aspect: config.aspect,
            zNear: config.zNear,
            zFar: config.zFar,
            isVerticalOrbit: isVerticalOrbit,
        });
    }

    // Update the moon's orbit and rotation based on time
    update(deltaTime: number) {
        if (this.isVerticalOrbit) {
            // Vertical orbit
            this.angle += this.orbitSpeed * deltaTime;

            if (this.angle >= 2 * Math.PI) {
                this.angle -= 2 * Math.PI;
            }
        } else {
            // Horizontal orbit
            this.angle += this.orbitSpeed * deltaTime;
        }
    }

    // Render the moon, taking into account the parent's position and the camera's view
    public render(parentX: number, parentY: number, parentZ: number, cameraAngleX: number, cameraAngleY: number, cameraDistance: number): void {
        let x, y, z;

        // Calculate the moon's position based on whether its orbit is vertical or horizontal
        if (this.isVerticalOrbit) {
            // Vertical orbit (X-Y plane)
            x = parentX + this.orbitRadius * Math.cos(this.angle);
            y = parentY + this.orbitRadius * Math.sin(this.angle);
            z = parentZ;
        } else {
            // Horizontal orbit (X-Z plane)
            x = parentX + this.orbitRadius * Math.cos(this.angle);
            y = parentY;
            z = parentZ + this.orbitRadius * Math.sin(this.angle);
        }

        // Calculate the light direction vector pointing from the moon to the parent
        const lightDirection = new Float32Array([x - parentX, y - parentY, z - parentZ]);
        const length = Math.sqrt(lightDirection[0] ** 2 + lightDirection[1] ** 2 + lightDirection[2] ** 2);
        lightDirection[0] /= length;
        lightDirection[1] /= length;
        lightDirection[2] /= length;

        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z, this.rotationAngle, this.orbitSpeed, lightDirection, false);

        this.orbitField.render(cameraAngleX, cameraAngleY, cameraDistance);
    }

    // Set whether the moon's orbit should be vertical or horizontal
    setVerticalOrbit(isVertical: boolean) {
        this.isVerticalOrbit = isVertical;
    }

    // Toggle the visibility of the moon's orbit path
    public setOrbitVisible(visible: boolean): void {
        this.orbitField.setVisible(visible);
    }
}
