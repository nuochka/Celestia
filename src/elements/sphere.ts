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
}

export class Sphere {
    private gl: WebGLRenderingContext;  
    private config: SphereConfig;        
    private program: WebGLProgram;       
    private positionBuffer: WebGLBuffer; 
    private indexBuffer: WebGLBuffer;

    constructor(gl: WebGLRenderingContext, config: SphereConfig) {
        this.gl = gl;                     
        this.config = config;             

        // Shaders
        const vertexShaderSource = `
            attribute vec3 aPosition;
            uniform mat4 uMatrix;     
            void main(void) {
                gl_Position = uMatrix * vec4(aPosition, 1.0); 
            }
        `;

        const fragmentShaderSource = `
            precision mediump float; 
            void main(void) {
                gl_FragColor = vec4(1.0, 1.0, 0.4, 1.0);
            }
        `;

        this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        this.positionBuffer = this.createSphereBuffer();
        this.indexBuffer = this.createIndexBuffer();
    }

    // Function to create a buffer for sphere vertices
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

        // Create a buffer to hold the positions
        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGLBuffer');
        }

        // Bind the buffer and set the data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

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

        // Create a buffer to hold the indices
        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGLBuffer for indices');
        }

        // Bind the buffer and set the data
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        return buffer;
    }

    // Function to render the sphere
    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
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

        const matrixLocation = gl.getUniformLocation(program, 'uMatrix');
        gl.uniformMatrix4fv(matrixLocation, false, finalMatrix);

        const positionLocation = gl.getAttribLocation(program, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(positionLocation); 
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0); 

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        const vertexCount = (this.config.latitudeBands) * (this.config.longitudeBands) * 6; 
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0); 
    }
}
