import { Sphere, SphereConfig } from "../elements/sphere";
import { mat4 } from 'gl-matrix';

export class Saturn {
    private gl: WebGLRenderingContext;
    private planetSphere: Sphere;

    // Saturn orbit parameters
    private saturnOrbitRadius: number = 18; 
    private saturnAngle: number = 0;
    private saturnOrbitSpeed: number = 0.002; 

    constructor(gl: WebGLRenderingContext) {
        const saturnConfig: SphereConfig = {
            radius: 1.2, 
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 100,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 100.0,
            textureUrl: 'http://127.0.0.1:8080/textures/saturn_texture.jpg'
        };


        this.gl = gl;
        this.planetSphere = new Sphere(gl, saturnConfig);
        this.planetSphere.loadTexture(saturnConfig.textureUrl);
    }

    public update() {
        this.saturnAngle += this.saturnOrbitSpeed;
        if (this.saturnAngle >= 2 * Math.PI) {
            this.saturnAngle -= 2 * Math.PI;
        }
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const saturnX = this.saturnOrbitRadius * Math.cos(this.saturnAngle);
        const saturnY = 0;
        const saturnZ = this.saturnOrbitRadius * Math.sin(this.saturnAngle);

        this.planetSphere.render(cameraAngleX, cameraAngleY, cameraDistance, saturnX, saturnY, saturnZ);
    }
}
