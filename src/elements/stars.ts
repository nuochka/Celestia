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
    private blinkBuffer: WebGLBuffer;

    constructor(gl: WebGLRenderingContext, config: StarFieldConfig) {
        this.gl = gl;
        this.config = config;

        // Shaders
        const vertexShaderSource = `
            attribute vec3 aPosition;
            attribute float aBlinkSpeed;
            attribute float aBlinkPhase;
            attribute float aRandomOffset; 
            varying float vBlinkSpeed;
            varying float vBlinkPhase;
            varying float vRandomOffset; 
            uniform mat4 uMatrix;
            void main(void) {
                gl_PointSize = 1.2; 
                gl_Position = uMatrix * vec4(aPosition, 0.8);
                vBlinkSpeed = aBlinkSpeed;
                vBlinkPhase = aBlinkPhase;
                vRandomOffset = aRandomOffset;
            }
        `;

        // Fragment Shader
        const fragmentShaderSource = `
            precision mediump float;
            varying float vBlinkSpeed;
            varying float vBlinkPhase;
            varying float vRandomOffset;
            uniform float uTime;

            void main(void) {
                // Calculate twinkling effect with random offset
                float twinkleAmplitude = 0.8;
                float baseAlpha = 0.2;
                float alpha = baseAlpha + twinkleAmplitude * sin(uTime * vBlinkSpeed + vBlinkPhase + vRandomOffset); 
                alpha = clamp(alpha, 0.0, 1.0);
                
                // Glow parameters
                float glowRadius = 0.15; 
                float glowIntensity = 1.0;

                // Calculate distance from center (gl_PointCoord contains coordinates of the point)
                vec2 coords = gl_PointCoord - vec2(0.5);
                float distance = length(coords);

                // Determine final color
                vec4 starColor = vec4(1.0, 1.0, 1.0, alpha);
                
                // Create a glow effect that fades out with distance from the star center
                float glowEffect = glowIntensity * alpha * smoothstep(glowRadius, glowRadius + 0.05, distance);
                vec4 glowColor = vec4(1.0, 1.0, 1.0, glowEffect);

                gl_FragColor = starColor + glowColor; // Combine star color and glow
            }
        `;
    
        this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        this.positionBuffer = this.createStarPositionBuffer();
        this.blinkBuffer = this.createBlinkBuffer();
    }

    // Creating a buffer for star positions
    private createStarPositionBuffer(): WebGLBuffer {
        const starPositions: number[] = [];
        const spawnRadius = 2;
        for (let i = 0; i < this.config.numStars; i++) {
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * 2 * Math.PI;

            const x = spawnRadius * Math.sin(theta) * Math.cos(phi);
            const y = spawnRadius * Math.cos(theta);
            const z = spawnRadius * Math.sin(theta) * Math.sin(phi);

            starPositions.push(x, y, z);
        }

        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGLBuffer for star positions');
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(starPositions), this.gl.STATIC_DRAW);
        return buffer;
    }

    // Creating a buffer for blink speed, phase, and random offset
    private createBlinkBuffer(): WebGLBuffer {
        const blinkData: number[] = [];
        for (let i = 0; i < this.config.numStars; i++) {
            const blinkSpeed = 1.0 + Math.random() * 1.5; 
            const blinkPhase = Math.random() * 2 * Math.PI;
            const randomOffset = Math.random() * 2 * Math.PI; // Random offset for unpredictable twinkling
            blinkData.push(blinkSpeed, blinkPhase, randomOffset);
        }

        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create WebGLBuffer for blink data');
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(blinkData), this.gl.STATIC_DRAW);
        return buffer;
    }

    // Rendering the star field with blinking effect
    public render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const gl = this.gl;
        const program = this.program;
        gl.useProgram(program);
        
        // Time uniform for blinking animation
        const timeLocation = gl.getUniformLocation(program, "uTime");
        gl.uniform1f(timeLocation, performance.now() * 0.001);

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

        // Blink attributes
        const blinkSpeedLocation = gl.getAttribLocation(program, 'aBlinkSpeed');
        const blinkPhaseLocation = gl.getAttribLocation(program, 'aBlinkPhase');
        const randomOffsetLocation = gl.getAttribLocation(program, 'aRandomOffset');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.blinkBuffer);
        gl.enableVertexAttribArray(blinkSpeedLocation);
        gl.vertexAttribPointer(blinkSpeedLocation, 1, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(blinkPhaseLocation);
        gl.vertexAttribPointer(blinkPhaseLocation, 1, gl.FLOAT, false, 12, 4);
        gl.enableVertexAttribArray(randomOffsetLocation);
        gl.vertexAttribPointer(randomOffsetLocation, 1, gl.FLOAT, false, 12, 8);

        gl.drawArrays(gl.POINTS, 0, this.config.numStars);
    }
}
