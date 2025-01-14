import { mat4 } from 'gl-matrix';

export class AsteroidBelt {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private asteroidBuffer: WebGLBuffer;
    private numAsteroids: number;
    private asteroidPositions: Float32Array;
    private asteroidSpeeds: Float32Array;
    private minDistance: number;
    private maxDistance: number;
    private angleOffsets: Float32Array;

    constructor(gl: WebGLRenderingContext, numAsteroids: number, minDistance: number, maxDistance: number) {
        this.gl = gl;
        this.numAsteroids = numAsteroids;
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
        this.angleOffsets = new Float32Array(numAsteroids); // Array to store angle offsets for each asteroid
        this.asteroidSpeeds = new Float32Array(numAsteroids); // Array to store speed for each asteroid
        this.asteroidPositions = this.generateAsteroidPositions(); // Generates random asteroid positions

        // Vertex shader source code
        const vertexShaderSource = `
            attribute vec3 aPosition;
            uniform mat4 uMatrix;
            void main(void) {
                gl_Position = uMatrix * vec4(aPosition, 1.0);
                gl_PointSize = 3.0;
            }
        `;

        // Fragment shader source code
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

    // Function to create a shader program
    private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);

        // Create shader program and attach shaders
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error("Shader program linking failed: " + this.gl.getProgramInfoLog(program));
        }

        return program;
    }


    // Function to compile a shader program
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

    // Function to generate random asteroid positions
    private generateAsteroidPositions(): Float32Array {
        const positions: number[] = [];
        // Generate positions for each asteroid
        for (let i = 0; i < this.numAsteroids; i++) {
            const distance = Math.random() * (this.maxDistance - this.minDistance) + this.minDistance;
            const angle = Math.random() * Math.PI * 2;
            const x = distance * Math.cos(angle);
            const y = Math.random() * 0.1 - 0.05;
            const z = distance * Math.sin(angle);

            this.angleOffsets[i] = angle; // Store angle offset for later use
            this.asteroidSpeeds[i] = (Math.random() * 0.5 + 0.5) * 0.01; // Assign random speed

            positions.push(x, y, z); // Store position in array
        }
        return new Float32Array(positions);
    }

     // Function to create and bind a buffer for asteroid positions
    private createAsteroidBuffer(): WebGLBuffer {
        const buffer = this.gl.createBuffer();
        if (!buffer) throw new Error('Failed to create buffer for asteroids');

        // Bind the buffer and load asteroid positions into it
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.asteroidPositions, this.gl.DYNAMIC_DRAW);

        return buffer;
    }

    // Function to update the positions of the asteroids
    public update(deltaTime: number) {
        // Update the position of each asteroid based on its speed and angle offset
        for (let i = 0; i < this.numAsteroids; i++) {
            this.angleOffsets[i] += this.asteroidSpeeds[i] * deltaTime;
            const distance = Math.sqrt(
                this.asteroidPositions[i * 3] ** 2 + this.asteroidPositions[i * 3 + 2] ** 2
            );
            this.asteroidPositions[i * 3] = distance * Math.cos(this.angleOffsets[i]); 
            this.asteroidPositions[i * 3 + 1] += Math.sin(deltaTime * 0.001) * 0.01;
            this.asteroidPositions[i * 3 + 2] = distance * Math.sin(this.angleOffsets[i]);
        }
        // Update the buffer with new asteroid positions
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.asteroidBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.asteroidPositions);
    }

    // Function to render the asteroid belt
    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const gl = this.gl;
        gl.useProgram(this.program);
    
        // Set up perspective and camera matrices
        const perspectiveMatrix = mat4.create();
        mat4.perspective(perspectiveMatrix, Math.PI / 4, gl.canvas.width / gl.canvas.height, 0.1, 1000);

        const cameraMatrix = mat4.create();
        const cameraPosition = Float32Array.from([
            cameraDistance * Math.sin(cameraAngleY) * Math.cos(cameraAngleX),
            cameraDistance * Math.sin(cameraAngleX),
            cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX)
        ]);
        mat4.lookAt(cameraMatrix, cameraPosition, new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));
    
        // Combine perspective and camera matrices
        const matrix = mat4.create();
        mat4.multiply(matrix, perspectiveMatrix, cameraMatrix);
    
        // Send the combined matrix to the shader
        const matrixLocation = gl.getUniformLocation(this.program, 'uMatrix');
        gl.uniformMatrix4fv(matrixLocation, false, matrix);
    
        // Set the color of the asteroids (gray)
        const colorLocation = gl.getUniformLocation(this.program, 'uColor');
        gl.uniform4fv(colorLocation, [0.6, 0.6, 0.6, 1.0]);

        // Bind the asteroid position buffer and set up vertex attribute
        const positionLocation = gl.getAttribLocation(this.program, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.asteroidBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, this.numAsteroids);
    }
}
