import { Planet } from "../elements/planet";
import { SphereConfig } from "../elements/sphere";
import { Ring } from "../elements/ring";

export class Saturn extends Planet {
    private ring: Ring;
    private ringAngle: number = 0;

    constructor(gl: WebGLRenderingContext) {
        const saturnConfig: SphereConfig = {
            radius: 1.2,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/saturn_texture.jpg'
        };
        
        super(gl, saturnConfig, 22.0, -0.002, 0.001, [0.8, 0.8, 0.6, 1.0]);

        this.ring = new Ring(gl, 1.5, 3.0, 64, 'http://127.0.0.1:8080/textures/saturn_ring.png');
    }
    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const ringRotationSpeed = 0.1;
        this.ringAngle += ringRotationSpeed;
        this.ring.render(cameraAngleX, cameraAngleY, cameraDistance);
    }
}
