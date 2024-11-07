import { mat4 } from 'gl-matrix';

export class OrbitField {
    private gl: WebGLRenderingContext;
    private radius: number;
    private color: [number, number, number, number];
    private fieldOfView: number;
    private aspect: number;
    private zNear: number;
    private zFar: number;
    private orbitBuffer: WebGLBuffer;
    private numVertices: number; 

    constructor(gl: WebGLRenderingContext, config: { radius: number, color: [number, number, number, number], fieldOfView: number, aspect: number, zNear: number, zFar: number }) {
        this.gl = gl;
        this.radius = config.radius;
        this.color = config.color; 
        this.fieldOfView = config.fieldOfView;
        this.aspect = config.aspect;
        this.zNear = config.zNear;
        this.zFar = config.zFar;

        // Create the orbit buffer
        const orbitVertices = this.createOrbitVertices(this.radius, 100);
        this.orbitBuffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.orbitBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, orbitVertices, this.gl.STATIC_DRAW);
        
        this.numVertices = orbitVertices.length / 3;
    }

    // Function to create orbit vertices
    private createOrbitVertices(radius: number, segments: number): Float32Array {
        const vertices = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            vertices.push(x, 0, z);
        }
        return new Float32Array(vertices);
    }

    // Render the orbit
    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const gl = this.gl;
    
        const program = gl.createProgram()!;
        const vertexShaderSource = `
            attribute vec3 aPosition;
            uniform mat4 uMatrix;
            void main(void) {
                gl_Position = uMatrix * vec4(aPosition, 1.0);
            }
        `;
        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 uColor;
            void main(void) {
                gl_FragColor = uColor;
            }
        `;
        
        // Create shaders and program
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error("Error compiling vertex shader: ", gl.getShaderInfoLog(vertexShader));
            return;
        }
    
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error("Error compiling fragment shader: ", gl.getShaderInfoLog(fragmentShader));
            return;
        }
    
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
    
        // Create perspective and camera matrices
        const perspectiveMatrix = mat4.create();
        mat4.perspective(perspectiveMatrix, (this.fieldOfView * Math.PI) / 180, this.aspect, this.zNear, this.zFar);
    
        const cameraMatrix = mat4.create();
        const cameraPosition = Float32Array.from([
            cameraDistance * Math.sin(cameraAngleY) * Math.cos(cameraAngleX),
            cameraDistance * Math.sin(cameraAngleX),
            cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX)
        ]);
    
        mat4.lookAt(cameraMatrix, cameraPosition, new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));
    
        const finalMatrix = mat4.create();
        mat4.multiply(finalMatrix, perspectiveMatrix, cameraMatrix);
    
        // Check if the color is a valid array of 4 numbers
        if (Array.isArray(this.color) && this.color.length === 4) {
            if (this.color.every(val => typeof val === 'number')) {
                const colorLocation = gl.getUniformLocation(program, "uColor");
                gl.uniform4fv(colorLocation, this.color);
            } else {
                console.error("Color array contains invalid elements.");
            }
        } else {
            console.error("Invalid color array. It must be an array of 4 numbers.");
        }
    
        const matrixLocation = gl.getUniformLocation(program, 'uMatrix');
        gl.uniformMatrix4fv(matrixLocation, false, finalMatrix);
    
        // Setup position buffer
        const positionLocation = gl.getAttribLocation(program, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.orbitBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
        // Draw the orbit
        gl.drawArrays(gl.LINE_STRIP, 0, this.numVertices);
    }
    
}
