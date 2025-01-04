import { mat4 } from 'gl-matrix';
import { createProgram } from '../utils/webgl-utils';
import { OrbitField } from './orbit';

export interface AsteroidConfig {
    radius: number;
    xScale: number;
    zScale: number;        
    latitudeBands: number;   
    longitudeBands: number;  
    fieldOfView: number;     
    aspect: number;          
    zNear: number;           
    zFar: number;            
    textureUrl: string;
    roughness: number;
}

export class Asteroid {
    public gl: WebGLRenderingContext;  
    public config: AsteroidConfig;        
    public program: WebGLProgram;       
    private positionBuffer: WebGLBuffer; 
    private indexBuffer: WebGLBuffer; 
    private texCoordBuffer: WebGLBuffer; 
    private texture?: WebGLTexture;

    protected moons: AsteroidMoon[] = [];

    constructor(gl: WebGLRenderingContext, config: AsteroidConfig) {
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
            }`
        ;

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
            }`
        ;

        this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        this.positionBuffer = this.createAsteroidBuffer();
        this.indexBuffer = this.createIndexBuffer();
        this.texCoordBuffer = this.createTexCoordBuffer();

        this.loadTexture(config.textureUrl)
            .then(texture => {
                this.texture = texture; 
            })
            .catch(error => {
                console.error(error);
            });
    }

    private createAsteroidBuffer(): WebGLBuffer {
        const positions: number[] = []; 
        const normals: number[] = [];
        const { radius, latitudeBands, longitudeBands, roughness, xScale, zScale } = this.config; 
    
        for (let lat = 0; lat <= latitudeBands; lat++) {
            const theta = (lat * Math.PI) / latitudeBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            for (let lon = 0; lon <= longitudeBands; lon++) {
                const phi = (lon * 2 * Math.PI) / longitudeBands; 
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
    
                // Add random roughness to the radius
                const randomRoughness = (Math.random() * 2 - 1) * roughness;
                const adjustedRadius = radius + randomRoughness;
    
                // Apply scaling for an elliptical shape
                const x = adjustedRadius * xScale * cosPhi * sinTheta; 
                const y = adjustedRadius * cosTheta;           // Keep y axis as is
                const z = adjustedRadius * zScale * sinPhi * sinTheta; 
    
                // Normal for each vertex - approximate for the rough surface
                const length = Math.sqrt(x * x + y * y + z * z);
                normals.push(x / length, y / length, z / length); 
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

    // Create texture coordinates for the asteroid
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

    public addAsteroidMoon(moon: AsteroidMoon): void {
        this.moons.push(moon);
    }

    // Update asteroid and its moons
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
}


export class AsteroidMoon {
    private gl: WebGLRenderingContext;
    private asteroid: Asteroid;
    private orbitRadius: number;
    private orbitSpeed: number;
    private rotationSpeed: number;

    private angle: number = 0;
    private rotationAngle: number = 0;
    private orbitField: OrbitField;

    constructor(gl: WebGLRenderingContext, config: AsteroidConfig, orbitRadius: number, orbitSpeed: number, rotationSpeed: number) {
        this.gl = gl;

        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.rotationSpeed = rotationSpeed;
        
        this.asteroid = new Asteroid(gl, config);
        this.asteroid.loadTexture(config.textureUrl);

        this.orbitField = new OrbitField(gl, {
            radius: orbitRadius,
            color: [0.68, 0.85, 0.90, 1.0],
            fieldOfView: config.fieldOfView,
            aspect: config.aspect,
            zNear: config.zNear,
            zFar: config.zFar,
        });
    }

    public setMoonSpeeds(orbitSpeed: number, rotationSpeed: number): void {
        this.orbitSpeed = -orbitSpeed;
        this.rotationSpeed = -rotationSpeed;
    }

    public update(scale: number): void {
        this.angle = (this.angle + this.orbitSpeed * scale) % (2 * Math.PI);
        this.rotationAngle = (this.rotationAngle + this.rotationSpeed * scale) % (2 * Math.PI);
    }

    public render(parentX: number, parentY: number, parentZ: number, cameraAngleX: number, cameraAngleY: number, cameraDistance: number): void {
        const x = parentX + this.orbitRadius * Math.cos(this.angle);
        const y = parentY;
        const z = parentZ + this.orbitRadius * Math.sin(this.angle);

        const lightDirection = new Float32Array([x - parentX, y - parentY, z - parentZ]);
        const length = Math.sqrt(lightDirection[0] ** 2 + lightDirection[1] ** 2 + lightDirection[2] ** 2);
        lightDirection[0] /= length;
        lightDirection[1] /= length;
        lightDirection[2] /= length;

        this.asteroid.render(cameraAngleX, cameraAngleY, cameraDistance, x, y, z, this.rotationAngle, this.orbitSpeed, lightDirection, false);

        this.orbitField.render(cameraAngleX, cameraAngleY, cameraDistance);
    }

    public setOrbitVisible(visible: boolean): void {
        this.orbitField.setVisible(visible);
    }
}
