import { Planet } from "../elements/planet";
import { Sphere, SphereConfig } from "../elements/sphere"
import { Ring } from "../elements/ring"
import { Moon } from "../elements/moon";

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
        super(gl, uranusConfig, 40.0, -0.0001, 0.0005, [0.8, 0.8, 0.6, 1.0]);
    }
}

const uranusSphereConfig = {
    ...uranusConfig,
    radius: 0.6
};


export class UranusSphere extends Sphere {
    private orbitRadius: number = 0.0001;
    private angle: number = 0;
    private angularSpeed: number = 0.005;
    private ring: Ring;
    private paused: boolean = false;
    
    constructor(gl: WebGLRenderingContext) {
        super(gl, uranusSphereConfig);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.ring = new Ring(
            gl, 
            0.8, 
            1.2, 
            100, 
            'http://127.0.0.1:8080/textures/uranus_ring.png', 
            uranusConfig.fieldOfView, 
            uranusConfig.aspect, 
            uranusConfig.zNear,
             uranusConfig.zFar, 
             0.0005, 
             0.0004, 
             0, 
             0, 
             0, 
             false,
             true
        );

        this.createAndAddMoon(gl, 2.0, -0.002, 'http://127.0.0.1:8080/textures/moons/puck_texture.jpg'); 
        this.createAndAddMoon(gl, 3.0, -0.0012, 'http://127.0.0.1:8080/textures/moons/miranda_texture.jpg');
        this.createAndAddMoon(gl, 4.0, -0.0010, 'http://127.0.0.1:8080/textures/moons/ariel_texture.jpg');
        this.createAndAddMoon(gl, 5.0, -0.0008, 'http://127.0.0.1:8080/textures/moons/umbriel_texture.jpg');
        this.createAndAddMoon(gl, 8.5, -0.0006, 'http://127.0.0.1:8080/textures/moons/titania_texture.jpg');
        this.createAndAddMoon(gl, 10.5, -0.0003, 'http://127.0.0.1:8080/textures/moons/oberon_texture.jpg');
    }

    private createAndAddMoon(
        gl: WebGLRenderingContext,
        orbitRadius: number,
        orbitalSpeed: number,
        textureUrl: string
    ) {
        const moonConfig: SphereConfig = {
            radius: 0.1,
            latitudeBands: 30,
            longitudeBands: 30,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: textureUrl,
        };

        const moon = new Moon(gl, moonConfig, orbitRadius, orbitalSpeed, 0.001, true);
        moon.setVerticalOrbit(true);
        this.addMoon(moon);
    }

    togglePause() {
        this.paused = !this.paused;
    }

    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        if (!this.paused) {
            this.angle += this.angularSpeed;
        }

        const x = this.orbitRadius * Math.cos(this.angle);
        const y = 0;
        const z = this.orbitRadius * Math.sin(this.angle);
        const lightDirection = new Float32Array([-x, -y, -z]);

        const length = Math.sqrt(lightDirection[0] ** 2 + lightDirection[1] ** 2 + lightDirection[2] ** 2);
        lightDirection[0] /= length;
        lightDirection[1] /= length;
        lightDirection[2] /= length;

        super.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z, this.angle, 0, lightDirection, false);
        this.ring.render(cameraAngleX, cameraAngleY, cameraDistance);

        if (!this.paused) {
            this.moons.forEach(moon => {
                moon.update(1);
                moon.render(x, y, z, cameraAngleX, cameraAngleY, cameraDistance);
            });
        }

        this.asteroidMoons.forEach(asteroid => {
            if(!this.paused){
                asteroid.update(1);
            }
            asteroid.render(x, y, z, cameraAngleX, cameraAngleY, cameraDistance);
        });
    }
}