import { mat4 } from 'gl-matrix';
import { createProgram } from './../webgl-utils';

export interface GridFieldConfig {
    size: number;
    gridColor: [number, number, number, number];
    fieldOfView: number;
    aspect: number;
    zNear: number;
    zFar: number;
}

export interface SubgridFieldConfig extends GridFieldConfig {
    subgridColor: [number, number, number, number];
    subgridSize: number;
}

abstract class BaseGridField {
    protected gl: WebGLRenderingContext;
    protected config: GridFieldConfig;
    protected program: WebGLProgram;
    protected positionBuffer: WebGLBuffer;
    protected cameraDistance: number = 0.5;

    constructor(gl: WebGLRenderingContext, config: GridFieldConfig, vertexShaderSource: string, fragmentShaderSource: string) {
        this.gl = gl;
        this.config = config;
        this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        this.positionBuffer = this.createGridBuffer();
        window.addEventListener('wheel', this.handleMouseWheel.bind(this), { passive: false });
    }

    // Method to create a buffer for the grid lines
    protected createGridBuffer(): WebGLBuffer {
        const gridLines: number[] = [];
        const halfSize = this.config.size / 2;

        // Generate horizontal and vertical lines
        for (let i = -halfSize; i <= halfSize; i++) {
            gridLines.push(-halfSize, 0, i, halfSize, 0, i);
            gridLines.push(i, 0, -halfSize, i, 0, halfSize);
        }

        const buffer = this.gl.createBuffer();
        if (!buffer) throw new Error('Failed to create WebGLBuffer for grid field');

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(gridLines), this.gl.STATIC_DRAW);
        return buffer;
    }

    // Method to handle mouse wheel events
    private handleMouseWheel(event: WheelEvent) {
        event.preventDefault();
        const delta = event.deltaY < 0 ? -0.5 : 0.5;
        this.cameraDistance = Math.max(1, this.cameraDistance + delta);
    }

    // Common render logic for both grid and subgrid
    protected render(cameraAngleX: number, cameraAngleY: number) {
        const gl = this.gl;
        const program = this.program;

        gl.useProgram(program);

        // Create perspective matrix
        const perspectiveMatrix = mat4.create();
        mat4.perspective(perspectiveMatrix, (this.config.fieldOfView * Math.PI) / 180, this.config.aspect, this.config.zNear, this.config.zFar);

        // Create camera matrix
        const cameraMatrix = mat4.create();
        const cameraPosition = Float32Array.from([
            this.cameraDistance * Math.sin(cameraAngleY) * Math.cos(cameraAngleX),
            this.cameraDistance * Math.sin(cameraAngleX),
            this.cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX)
        ]);

        mat4.lookAt(cameraMatrix, cameraPosition, new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));

        // Combine matrices
        const finalMatrix = mat4.create();
        mat4.multiply(finalMatrix, perspectiveMatrix, cameraMatrix);

        // Set uniform variables
        const colorLocation = gl.getUniformLocation(program, "uColor");
        gl.uniform4fv(colorLocation, this.config.gridColor);

        const matrixLocation = gl.getUniformLocation(program, 'uMatrix');
        gl.uniformMatrix4fv(matrixLocation, false, finalMatrix);

        // Setup position buffer
        const positionLocation = gl.getAttribLocation(program, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        // Set line width based on camera distance
        gl.lineWidth(Math.max(1, 2 / this.cameraDistance));
    }
}

export class GridField extends BaseGridField {
    constructor(gl: WebGLRenderingContext, config: GridFieldConfig) {
        const vertexShaderSource = `
            attribute vec3 aPosition;
            uniform mat4 uMatrix;
            void main(void) {
                gl_Position = uMatrix * vec4(aPosition, 0.15);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 uColor;
            void main(void) {
                gl_FragColor = uColor;
            }
        `;

        super(gl, config, vertexShaderSource, fragmentShaderSource);
    }

    // Render the grid
    public render(cameraAngleX: number, cameraAngleY: number) {
        super.render(cameraAngleX, cameraAngleY);
        const totalLines = (this.config.size + 1) * 4;
        this.gl.drawArrays(this.gl.LINES, 0, totalLines);
    }
}

export class SubgridField extends BaseGridField {
    private subgridColor: [number, number, number, number];
    private subgridSize: number;

    constructor(gl: WebGLRenderingContext, config: SubgridFieldConfig) {
        super(gl, config, `
            attribute vec3 aPosition;
            uniform mat4 uMatrix;
            void main(void) {
                gl_Position = uMatrix * vec4(aPosition, 1.5);
            }
        `, `
            precision mediump float;
            uniform vec4 uColor;
            void main(void) {
                gl_FragColor = uColor;
            }
        `);

        this.subgridColor = config.subgridColor;
        this.subgridSize = config.subgridSize;
    }

    // Override the createGridBuffer method to include subgrid lines
    protected createGridBuffer(): WebGLBuffer {
        const gridLines: number[] = [];
        const halfSize = this.config.size / 2;

        // Call the base method for main grid lines
        for (let i = -halfSize; i <= halfSize; i++) {
            gridLines.push(-halfSize, 0, i, halfSize, 0, i);
            gridLines.push(i, 0, -halfSize, i, 0, halfSize); 
        }

        // Create subgrid lines
        const numSubgrids = this.config.size / this.subgridSize;
        for (let i = 1; i < numSubgrids; i++) {
            const subgridPosition = i * this.subgridSize - halfSize;
            gridLines.push(subgridPosition, 0, -halfSize, subgridPosition, 0, halfSize);
            gridLines.push(-halfSize, 0, subgridPosition, halfSize, 0, subgridPosition);
        }

        const buffer = this.gl.createBuffer();
        if (!buffer) throw new Error('Failed to create WebGLBuffer for subgrid field');

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(gridLines), this.gl.STATIC_DRAW);
        return buffer;
    }

    // Render the grid and subgrid
    public render(cameraAngleX: number, cameraAngleY: number) {
        super.render(cameraAngleX, cameraAngleY);
        const totalLines = (this.config.size + 1) * 4 + (this.config.size / this.subgridSize) * 4;
        this.gl.drawArrays(this.gl.LINES, 0, totalLines);
    }
}
