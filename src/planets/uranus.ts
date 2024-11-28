import { Planet } from "../elements/planet";

export  const uranusConfig = {
    radius: 0.8,
    latitudeBands: 30,
    longitudeBands: 30,
    fieldOfView: 50,
    aspect: window.innerWidth / window.innerHeight,
    zNear: 0.1,
    zFar: 1000.0,
    textureUrl: 'http://127.0.0.1:8080/textures/uranus_texture.png'
};

export class Uranus extends Planet {
    constructor(
        gl: WebGLRenderingContext
    ) {
        super(gl, uranusConfig, 40.0, -0.0004, 0.0005, [0.8, 0.8, 0.6, 1.0]);
    }
}
