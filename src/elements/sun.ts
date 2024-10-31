import { Sphere, SphereConfig } from "./sphere";

export class Sun {
    private gl: WebGLRenderingContext;
    private sphere: Sphere;

    constructor(gl: WebGLRenderingContext) {
        const sunConfig: SphereConfig = {
            radius: 3.0,
            latitudeBands: 40,
            longitudeBands: 40,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/sun_texture.png'
        };

        this.gl = gl;
        this.sphere = new Sphere(gl, sunConfig);
        this.sphere.loadTexture(sunConfig.textureUrl);
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        this.sphere.render(cameraAngleX, cameraAngleY, cameraDistance);
    }
}
