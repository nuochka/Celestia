import { Planet } from "../elements/planet";
import { SphereConfig, Sphere } from "../elements/sphere";

export class Mars extends Planet{

    constructor(gl: WebGLRenderingContext) {
        const marsConfig: SphereConfig = {
            radius: 0.35,
            latitudeBands: 20,
            longitudeBands: 20,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/mars_texture.jpg'
        };
        super(gl, marsConfig, 10.0, 0.0037, 0.005, [0.8, 0.8, 0.6, 1.0]);
    }
}

export class MarsSphere extends Sphere{
    private orbitRadius: number = 0.0001;
    private angle: number = 0;
    private angularSpeed: number = 0;
    private paused: boolean = false;

    constructor(gl: WebGLRenderingContext) {
        const marsConfig: SphereConfig = {
            radius: 0.5,
            latitudeBands: 20,
            longitudeBands: 20,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: 'http://127.0.0.1:8080/textures/mars_texture.jpg'
        };
        super(gl, marsConfig);
        this.addAsteroidMoon(gl, 1.5, 0.005, 'http://127.0.0.1:8080/textures/moons/phobos_texture.jpg');
        this.addAsteroidMoon(gl, 3, 0.003, 'http://127.0.0.1:8080/textures/moons/deimos_texture.jpg'); 
    }

    togglePause() {
        this.paused = !this.paused;
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        if (!this.paused) {
            this.angle += this.angularSpeed;
        }

        this.angle += this.angularSpeed;
        const x = this.orbitRadius * Math.cos(this.angle);
        const y = 0;
        const z = this.orbitRadius * Math.sin(this.angle);
        const lightDirection = new Float32Array([-x, -y, -z]);

        const length = Math.sqrt(lightDirection[0] ** 2 + lightDirection[1] ** 2 + lightDirection[2] ** 2);
        lightDirection[0] /= length;
        lightDirection[1] /= length;
        lightDirection[2] /= length;

        super.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z, this.angle, 0, lightDirection, false);

            this.asteroidMoons.forEach(asteroid => {
                if(!this.paused){
                    asteroid.update(1);
                }
                asteroid.render(x, y, z, cameraAngleX, cameraAngleY, cameraDistance);
            });
        }
    }
