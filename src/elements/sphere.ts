import { mat4 } from 'gl-matrix';
import { createProgram } from '../utils/webgl-utils';
import { Moon } from './moon';
import { AsteroidMoon, AsteroidConfig } from './asteroid';

export interface SphereConfig {
    radius: number;          
    latitudeBands: number;   
    longitudeBands: number;  
    fieldOfView: number;     
    aspect: number;          
    zNear: number;           
    zFar: number;            
    textureUrl: string;
}

export class Sphere {
    public gl: WebGLRenderingContext;  
    public config: SphereConfig;        
    public program: WebGLProgram;       
    private positionBuffer: WebGLBuffer; 
    private indexBuffer: WebGLBuffer; 
    private texCoordBuffer: WebGLBuffer; 
    private texture?: WebGLTexture;

    protected moons: Moon[] = [];
    protected asteroidMoons: AsteroidMoon[] = [];

    constructor(gl: WebGLRenderingContext, config: SphereConfig) {
        this.gl = gl;                     
        this.config = config;             

        // Shaders
        const vertexShaderSource = `
            attribute vec3 aPosition;
            attribute vec2 aTexCoord;
            attribute vec3 aNormal;
            varying vec2 vTexCoord;
            varying vec3 vNormal; 
            uniform mat4 uMatrix;
            void main(void) {
                gl_Position = uMatrix * vec4(aPosition, 1.0); 
                vTexCoord = aTexCoord;
                vNormal = aNormal;
            }

        `;

        const fragmentShaderSource = `
            precision mediump float;
            varying vec2 vTexCoord;
            varying vec3 vNormal;

            uniform sampler2D uSampler;
            uniform vec3 uLightDirection;
            uniform vec3 uAmbientLight;

            void main(void) {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(uLightDirection);
                float diff = max(dot(normal, lightDir), 0.0);
                vec4 textureColor = texture2D(uSampler, vTexCoord);
                vec3 ambient = uAmbientLight * textureColor.rgb;
                vec3 diffuse = diff * textureColor.rgb;

                gl_FragColor = vec4(ambient + diffuse, textureColor.a);
            }
        `;

        this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        this.positionBuffer = this.createSphereBuffer();
        this.indexBuffer = this.createIndexBuffer();
        this.texCoordBuffer = this.createTexCoordBuffer();

        // Load the texture
        this.loadTexture(config.textureUrl)
            .then(texture => {
                this.texture = texture; 
            })
            .catch(error => {
                console.error(error);
            });
    }

    // Create a buffer for sphere vertices
    private createSphereBuffer(): WebGLBuffer {
        const positions: number[] = []; 
        const normals: number[] = []; // Normals for each vertex
        const { radius, latitudeBands, longitudeBands } = this.config; 

        for (let lat = 0; lat <= latitudeBands; lat++) {
            const theta = (lat * Math.PI) / latitudeBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            for (let lon = 0; lon <= longitudeBands; lon++) {
                const phi = (lon * 2 * Math.PI) / longitudeBands; 
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = radius * cosPhi * sinTheta; 
                const y = radius * cosTheta;           
                const z = radius * sinPhi * sinTheta; 
                // Normal for each vertex - normalized vector from center of sphere
                const length = Math.sqrt(x * x + y * y + z * z);
                normals.push(x / length, y / length, z / length); // Normalized normal coordinates
                
                positions.push(x, y, z);
            }
        }
        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGLBuffer');
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([...positions, ...normals]), this.gl.STATIC_DRAW);
        return buffer;
    }

    // Create texture coordinates for the sphere
    private createTexCoordBuffer(): WebGLBuffer {
        const texCoords: number[] = [];
        const { latitudeBands, longitudeBands } = this.config;

        for (let lat = 0; lat <= latitudeBands; lat++) {
            for (let lon = 0; lon <= longitudeBands; lon++) {
                const u = lon / longitudeBands; // Calculate U coordinate
                const v = lat / latitudeBands;   // Calculate V coordinate
                texCoords.push(u, v);
            }
        }

        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGLBuffer for texture coordinates');
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);

        return buffer;
    }

    // Function to create an index buffer for drawing triangles
    private createIndexBuffer(): WebGLBuffer {
        const indices: number[] = [];
        const { latitudeBands, longitudeBands } = this.config;
     
        for (let lat = 0; lat < latitudeBands; lat++) {
            for (let lon = 0; lon < longitudeBands; lon++) {
                const first = lat * (longitudeBands + 1) + lon;
                const second = first + longitudeBands + 1;
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
     
        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGLBuffer');
        }
     
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
     
        return buffer;
    }


    public loadTexture(url: string): Promise<WebGLTexture> {
        const texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to create texture');
        }
    
        // Bind the texture to WebGL
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    
        // Set texture parameters for wrapping and filtering
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
        // Set a 1x1 pixel as a placeholder for the texture
        const pixel = new Uint8Array([255, 255, 255, 255]);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixel);
    
        // Create a new image object to load the texture from the URL
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = url;
    
        return new Promise((resolve, reject) => {
            image.onload = () => {
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    
                if ((image.width & (image.width - 1)) === 0 && (image.height & (image.height - 1)) === 0) {
                    this.gl.generateMipmap(this.gl.TEXTURE_2D);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
                } else {
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                }
                resolve(texture);
            };
            image.onerror = () => {
                reject(new Error(`Failed to load texture image: ${url}`));
            };
        });
    }

    public addMoon(moon: Moon): void {
        this.moons.push(moon);
    }

    // Update sphere and its moons
    public update(scale: number): void {
        this.moons.forEach(moon => moon.update(scale));
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number, x: number, y: number, z: number, rotationAngle: number = 0, orbitalSpeed: number = 0, lightDirection: Float32Array, isSun: boolean) {
        if (!this.texture) return;
        this.moons.forEach(moon => moon.render(x, y, z, cameraAngleX, cameraAngleY, cameraDistance));
        
        const gl = this.gl;
        const program = this.program;
        gl.useProgram(program);
    
        const perspectiveMatrix = mat4.create();
        mat4.perspective(
            perspectiveMatrix,
            (this.config.fieldOfView * Math.PI) / 180, 
            this.config.aspect,                         
            this.config.zNear,                         
            this.config.zFar                            
        );
    
        const cameraMatrix = mat4.create();
        const cameraPosition = new Float32Array([
            cameraDistance * Math.sin(cameraAngleY) * Math.cos(cameraAngleX), 
            cameraDistance * Math.sin(cameraAngleX),                          
            cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX) 
        ]);
        
        mat4.lookAt(cameraMatrix, cameraPosition, new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));
        mat4.multiply(perspectiveMatrix, perspectiveMatrix, cameraMatrix);
        const objectMatrix = mat4.create();
        
        if (!isSun) {
            mat4.rotateY(objectMatrix, objectMatrix, rotationAngle);
            mat4.rotateY(objectMatrix, objectMatrix, orbitalSpeed);
            mat4.translate(objectMatrix, objectMatrix, [x, y, z]);
        }
        mat4.multiply(perspectiveMatrix, perspectiveMatrix, objectMatrix);
    
        const lightDirectionVec = new Float32Array([0, 0, 0]); 
        lightDirectionVec[0] = -x;
        lightDirectionVec[1] = -y;
        lightDirectionVec[2] = -z;
    
        const uMatrixLocation = this.gl.getUniformLocation(this.program, "uMatrix");
        const uLightDirectionLocation = this.gl.getUniformLocation(this.program, "uLightDirection");
        const uAmbientLightLocation = this.gl.getUniformLocation(this.program, "uAmbientLight");
    
        this.gl.uniformMatrix4fv(uMatrixLocation, false, perspectiveMatrix);
        this.gl.uniform3fv(uLightDirectionLocation, lightDirectionVec);
        
        this.gl.uniform3fv(uAmbientLightLocation, new Float32Array(isSun ? [1.0, 1.0, 0.5] : [0.1, 0.1, 0.1]));
    
        const aPositionLocation = this.gl.getAttribLocation(this.program, "aPosition");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(aPositionLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(aPositionLocation);
    
        const aNormalLocation = this.gl.getAttribLocation(this.program, "aNormal");
        this.gl.vertexAttribPointer(aNormalLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(aNormalLocation);
    
        const aTexCoordLocation = this.gl.getAttribLocation(this.program, "aTexCoord");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.vertexAttribPointer(aTexCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(aTexCoordLocation);
    
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        const uSamplerLocation = this.gl.getUniformLocation(this.program, "uSampler");
        this.gl.uniform1i(uSamplerLocation, 0);
    
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, 6 * this.config.latitudeBands * this.config.longitudeBands, this.gl.UNSIGNED_SHORT, 0);
    } 


    public addAsteroidMoon(gl: WebGLRenderingContext, orbitRadius: number, orbitalSpeed: number, textureUrl: string): void {
        const moonConfig: AsteroidConfig = {
            radius: 0.05,
            xScale: 1.2,
            zScale: 1.2,
            latitudeBands: 40,
            longitudeBands: 40,
            fieldOfView: 50,
            aspect: window.innerWidth / window.innerHeight,
            zNear: 0.1,
            zFar: 1000.0,
            textureUrl: textureUrl,
            roughness: 0.002,
        };

        const asteroid = new AsteroidMoon(gl, moonConfig, orbitRadius, orbitalSpeed, 0.001);
        this.asteroidMoons.push(asteroid);
    }
}