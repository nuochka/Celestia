import { Planet } from "../elements/planet";
import { Ring } from "../elements/ring";

export class Uranus extends Planet {
    private ring: Ring;

    constructor(
        gl: WebGLRenderingContext,
        x: number = 40.0
    ) {
        const uranusConfig = {
            radius: 0.8,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/uranus_texture.png'
        };
        super(gl, uranusConfig, x, -0.0004, 0.0005, [0.8, 0.8, 0.6, 1.0]);
        this.ring = new Ring(
            gl,
            1.0,
            1.5,
            100,
            'http://127.0.0.1:8080/textures/uranus_ring.jpg',
            uranusConfig.fieldOfView,
            uranusConfig.aspect,
            uranusConfig.zNear,
            uranusConfig.zFar,
            0.0005,
            0.0004,
            x,
            0,
            0,
            true
        );
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        this.ring.render(cameraAngleX, cameraAngleY, cameraDistance);
        super.render(cameraAngleX, cameraAngleY, cameraDistance);
    }
}
