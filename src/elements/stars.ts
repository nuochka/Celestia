import { mat4 } from 'gl-matrix';
import { createProgram } from './../webgl-utils';

export interface StarFieldConfig {
    numStars: number;
    fieldOfView: number;
    aspect: number;
    zNear: number;
    zFar: number;
}

export class StarField {
    private gl: WebGLRenderingContext;
    private config: StarFieldConfig;
    private program: WebGLProgram;
    private positionBuffer: WebGLBuffer;

    constructor(gl: WebGLRenderingContext, config: StarFieldConfig) {
        this.gl = gl;
        this.config = config;

        // Shaders
        const vertexShaderSource = `
            attribute vec3 aPosition;
            uniform mat4 uMatrix;
            void main(void) {
                gl_PointSize = 1.2;
                gl_Position = uMatrix * vec4(aPosition, 0.8);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            void main(void) {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
        `;

        this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        this.positionBuffer = this.createStarBuffer();
    }

    // Creating a star buffer
    private createStarBuffer(): WebGLBuffer {
        const starPositions: number[] = [];
        const spawnRadius = 2; 
        for (let i = 0; i < this.config.numStars; i++) {
            // Generate stars within a larger spherical area
            const theta = Math.random() * Math.PI; 
            const phi = Math.random() * 2 * Math.PI; 

            const x = spawnRadius * Math.sin(theta) * Math.cos(phi);
            const y = spawnRadius * Math.cos(theta);
            const z = spawnRadius * Math.sin(theta) * Math.sin(phi);

            starPositions.push(x, y, z);
        }

        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGLBuffer');
        }
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(starPositions), this.gl.STATIC_DRAW);
    return buffer;
}

    // Rendering the star field
    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const gl = this.gl;
        const program = this.program;
        gl.useProgram(program);
    
        // Perspective matrix
        const perspectiveMatrix = mat4.create();
        mat4.perspective(
            perspectiveMatrix,
            (this.config.fieldOfView * Math.PI) / 180,
            this.config.aspect,
            this.config.zNear,
            this.config.zFar
        );
    
        // Camera matrix
        const cameraMatrix = mat4.create();
        const cameraPosition = new Float32Array([
            cameraDistance * Math.sin(cameraAngleY) * Math.cos(cameraAngleX),
            cameraDistance * Math.sin(cameraAngleX),
            cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX)
        ]);
        
        mat4.lookAt(cameraMatrix, cameraPosition, new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));
    
        const finalMatrix = mat4.create();
        mat4.multiply(finalMatrix, perspectiveMatrix, cameraMatrix);
    
        // Pass data to shaders
        const matrixLocation = gl.getUniformLocation(program, 'uMatrix');
        gl.uniformMatrix4fv(matrixLocation, false, finalMatrix);
    
        // Bind buffer
        const positionLocation = gl.getAttribLocation(program, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, this.config.numStars);
    }
}    
