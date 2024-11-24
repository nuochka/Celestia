import { Planet } from "../elements/planet";
import { Ring } from "../elements/ring";

export class Saturn extends Planet {
    private ring: Ring;

    constructor(
        gl: WebGLRenderingContext,
        x: number = 22.0
    ) {
        const saturnConfig = {
            radius: 1.2,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/saturn_texture.jpg'
        };
        super(gl, saturnConfig, x, -0.002, 0.001, [0.8, 0.8, 0.6, 1.0]);
        this.ring = new Ring(
            gl,
            1.0,
            2.5,
            100,
            'http://127.0.0.1:8080/textures/saturn_ring.png',
            saturnConfig.fieldOfView,
            saturnConfig.aspect,
            saturnConfig.zNear,
            saturnConfig.zFar,
            0.001,
            0.002,
            x
        );
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        this.ring.render(cameraAngleX, cameraAngleY, cameraDistance);
        super.render(cameraAngleX, cameraAngleY, cameraDistance);
    }
}
