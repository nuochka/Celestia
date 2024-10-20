import { mat4 } from 'gl-matrix';
import { createProgram } from './../webgl-utils';

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
    private gl: WebGLRenderingContext;  
    private config: SphereConfig;        
    private program: WebGLProgram;       
    private positionBuffer: WebGLBuffer; 
    private indexBuffer: WebGLBuffer; 
    private texCoordBuffer: WebGLBuffer; 
    private texture?: WebGLTexture; 

    constructor(gl: WebGLRenderingContext, config: SphereConfig) {
        this.gl = gl;                     
        this.config = config;             

        // Shaders
        const vertexShaderSource = `
            attribute vec3 aPosition;
            attribute vec2 aTexCoord;
            varying vec2 vTexCoord;
            uniform mat4 uMatrix;     
            void main(void) {
                gl_Position = uMatrix * vec4(aPosition, 1.0); 
                vTexCoord = aTexCoord; // Pass texture coordinates to fragment shader
            }
        `;

        const fragmentShaderSource = `
            precision mediump float; 
            varying vec2 vTexCoord; 
            uniform sampler2D uSampler; 
            void main(void) {
                gl_FragColor = texture2D(uSampler, vTexCoord);
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
                this.render(0, 0, 2); // Initial rendering with default camera position
            })
            .catch(error => {
                console.error(error);
            });
    }

    // Create a buffer for sphere vertices
    private createSphereBuffer(): WebGLBuffer {
        const positions: number[] = []; 
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

                positions.push(x, y, z);
            }
        }

        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGLBuffer');
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

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
                const first = (lat * (longitudeBands + 1)) + lon;
                const second = first + longitudeBands + 1;

                // Create two triangles for each quad
                indices.push(first);
                indices.push(second);
                indices.push(first + 1);

                indices.push(second);
                indices.push(second + 1);
                indices.push(first + 1);
            }
        }

        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGLBuffer for indices');
        }

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        return buffer;
    }

    // Function to load a texture
    public loadTexture(url: string): Promise<WebGLTexture> {
        const texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to create texture');
        }
    
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    
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
                // Generate mipmaps for the texture
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
                resolve(texture); 
            };
            image.onerror = () => {
                reject(new Error(`Failed to load texture image: ${url}`)); 
            };
        });
    }
    
    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number, x: number = 0, y: number = 0, z: number = 0) {
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
    
        const finalMatrix = mat4.create();
        mat4.multiply(finalMatrix, perspectiveMatrix, cameraMatrix);

        // Apply translation to the sphere based on its position
        const translationMatrix = mat4.create();
        mat4.translate(translationMatrix, finalMatrix, [x, y, z]);
    
        const matrixLocation = gl.getUniformLocation(program, 'uMatrix');
        gl.uniformMatrix4fv(matrixLocation, false, translationMatrix);
    
        const positionLocation = gl.getAttribLocation(program, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(positionLocation); 
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0); 

        const texCoordLocation = gl.getAttribLocation(program, 'aTexCoord');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0); 
    
        const textureLocation = gl.getUniformLocation(program, 'uSampler');
        gl.activeTexture(gl.TEXTURE0);
        
        if (this.texture) { 
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }
    
        gl.uniform1i(textureLocation, 0); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        const vertexCount = (this.config.latitudeBands) * (this.config.longitudeBands) * 6; 
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0); 
    }
}
