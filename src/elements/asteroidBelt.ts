import { mat4 } from 'gl-matrix';

export class AsteroidBelt {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private asteroidBuffer: WebGLBuffer;
    private numAsteroids: number;
    private asteroidPositions: Float32Array;
    private minDistance: number;
    private maxDistance: number;

    constructor(gl: WebGLRenderingContext, numAsteroids: number, minDistance: number, maxDistance: number) {
        this.gl = gl;
        this.numAsteroids = numAsteroids;
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
        this.asteroidPositions = this.generateAsteroidPositions();

        const vertexShaderSource = `
            attribute vec3 aPosition;
            uniform mat4 uMatrix;
            void main(void) {
                gl_Position = uMatrix * vec4(aPosition, 1.0);
                gl_PointSize = 3.0;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 uColor;
            void main(void) {
                gl_FragColor = uColor;
            }
        `;

        this.program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
        this.asteroidBuffer = this.createAsteroidBuffer();
    }

    private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error("Shader program linking failed: " + this.gl.getProgramInfoLog(program));
        }

        return program;
    }

    private compileShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type);
        if (!shader) {
            throw new Error("Failed to create shader");
        }
    
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
    
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error("Shader compilation failed: " + this.gl.getShaderInfoLog(shader));
        }
    
        return shader;
    }
    
    private generateAsteroidPositions(): Float32Array {
        const positions: number[] = [];

        for (let i = 0; i < this.numAsteroids; i++) {
            const distance = Math.random() * (this.maxDistance - this.minDistance) + this.minDistance;
            const angle = Math.random() * Math.PI * 2;
            const x = distance * Math.cos(angle);
            const y = Math.random() * 0.1 - 0.05;
            const z = distance * Math.sin(angle);

            positions.push(x * 1.2, y, z * 1.2);
        }
        return new Float32Array(positions);
    }

    private createAsteroidBuffer(): WebGLBuffer {
        const buffer = this.gl.createBuffer();
        if (!buffer) throw new Error('Failed to create buffer for asteroids');

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.asteroidPositions, this.gl.STATIC_DRAW);

        return buffer;
    }

    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const gl = this.gl;
        gl.useProgram(this.program);
    
        const perspectiveMatrix = mat4.create();
        mat4.perspective(perspectiveMatrix, Math.PI / 4, gl.canvas.width / gl.canvas.height, 0.1, 1000);
    
        const cameraMatrix = mat4.create();
        const cameraPosition = Float32Array.from([
            cameraDistance * Math.sin(cameraAngleY) * Math.cos(cameraAngleX),
            cameraDistance * Math.sin(cameraAngleX),
            cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX)
        ]);
        mat4.lookAt(cameraMatrix, cameraPosition, new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));
    
        const matrix = mat4.create();
        mat4.multiply(matrix, perspectiveMatrix, cameraMatrix);
    
        const matrixLocation = gl.getUniformLocation(this.program, 'uMatrix');
        gl.uniformMatrix4fv(matrixLocation, false, matrix);
    
        const colorLocation = gl.getUniformLocation(this.program, 'uColor');
        gl.uniform4fv(colorLocation, [0.6, 0.6, 0.6, 1.0]);

        const positionLocation = gl.getAttribLocation(this.program, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.asteroidBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, this.numAsteroids);
    }    
}
