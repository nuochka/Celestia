import { mat4 } from 'gl-matrix';
import { createProgram } from '../utils/webgl-utils';

export class Ring {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private positionBuffer: WebGLBuffer;
    private texCoordBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;
    private texture: WebGLTexture | undefined;
    private indexCount: number;

    private fieldOfView: number;
    private aspect: number;
    private zNear: number;
    private zFar: number;
    private isUranus: boolean;

    private rotationAngle: number = 0;
    private orbitAngle: number = 0;
    private orbitalSpeed: number;
    private rotationSpeed: number;

    private x: number;
    private y: number;
    private z: number;

    constructor(
        gl: WebGLRenderingContext,
        innerRadius: number,
        outerRadius: number,
        radialSegments: number,
        textureUrl: string,
        fieldOfView: number,
        aspect: number,
        zNear: number,
        zFar: number,
        orbitalSpeed: number,
        rotationSpeed: number = 0.002,
        x: number = 22,
        y: number = 0,
        z: number = 0,
        isUranus: boolean = false,
    ) {
        this.gl = gl;

        this.fieldOfView = fieldOfView;
        this.aspect = aspect;
        this.zNear = zNear;
        this.zFar = zFar;
        this.isUranus = isUranus;

        this.program = Ring.createProgram(gl);

        const { positionBuffer, texCoordBuffer, indexBuffer, indexCount } =
            Ring.createBuffers(gl, innerRadius, outerRadius, radialSegments, isUranus);
        this.positionBuffer = positionBuffer;
        this.texCoordBuffer = texCoordBuffer;
        this.indexBuffer = indexBuffer;
        this.indexCount = indexCount;

        this.texture = undefined;
        Ring.loadTexture(gl, textureUrl).then((texture) => {
            this.texture = texture;
        });

        this.orbitalSpeed = orbitalSpeed;
        this.rotationSpeed = rotationSpeed;

        this.x = x;
        this.y = y;
        this.z = z;
    }

    static createProgram(gl: WebGLRenderingContext): WebGLProgram {
        const vertexShaderSource = `
            attribute vec3 aPosition;
            attribute vec2 aTexCoord;
            uniform mat4 uMatrix;
            varying vec2 vTexCoord;
            void main(void) {
                gl_Position = uMatrix * vec4(aPosition, 1.0);
                vTexCoord = aTexCoord;
            }
        `;
        const fragmentShaderSource = `
            precision mediump float;
            varying vec2 vTexCoord;
            uniform sampler2D uSampler;

            void main(void) {
                vec4 color = texture2D(uSampler, vTexCoord);

                if (color.a < 0.1) {
                    discard; // Discard fragments that are almost fully transparent
                }

                gl_FragColor = color;
            }
        `;
        return createProgram(gl, vertexShaderSource, fragmentShaderSource);
    }

    static createBuffers(
        gl: WebGLRenderingContext,
        innerRadius: number,
        outerRadius: number,
        radialSegments: number,
        isUranus: boolean
    ): {
        positionBuffer: WebGLBuffer;
        texCoordBuffer: WebGLBuffer;
        indexBuffer: WebGLBuffer;
        indexCount: number;
    } {
        const positions: number[] = [];
        const texCoords: number[] = [];
        const indices: number[] = [];
        const angleStep = (2 * Math.PI) / radialSegments;
    
        for (let i = 0; i <= radialSegments; i++) {
            const angle = i * angleStep;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
    
            positions.push(outerRadius * cos, 0, outerRadius * sin);
            texCoords.push(0, (i / radialSegments));
    
            positions.push(innerRadius * cos, 0, innerRadius * sin);
            texCoords.push(1, (i / radialSegments));
    
            if (i < radialSegments) {
                const base = i * 2;
                indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
            }
        }
    
        const positionBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
        const texCoordBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    
        const indexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
        return { positionBuffer, texCoordBuffer, indexBuffer, indexCount: indices.length };
    }    

    static loadTexture(gl: WebGLRenderingContext, textureUrl: string): Promise<WebGLTexture> {
        return new Promise((resolve, reject) => {
            const texture = gl.createTexture();
            const image = new Image();
    
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
                const isPowerOfTwo = (value: number) => (value & (value - 1)) === 0;
                if (isPowerOfTwo(image.width) && isPowerOfTwo(image.height)) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }
    
                resolve(texture!);
            };
    
            image.onerror = () => reject('Failed to load texture');
    
            image.crossOrigin = 'anonymous';
            image.src = textureUrl;
        });
    }

    public update(scale: number) {
        this.orbitAngle = (this.orbitAngle + this.orbitalSpeed * scale) % (2 * Math.PI);
        this.rotationAngle = (this.rotationAngle + this.rotationSpeed * scale) % (2 * Math.PI);
    }
    
    
    
    render(cameraAngleX: number, cameraAngleY: number, cameraDistance: number) {
        const gl = this.gl;
        const program = this.program;
    
        gl.useProgram(program);
    
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
        const perspectiveMatrix = mat4.create();
        mat4.perspective(
            perspectiveMatrix,
            (this.fieldOfView * Math.PI) / 180, 
            this.aspect,                         
            this.zNear,                         
            this.zFar                            
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
    
        mat4.rotateY(objectMatrix, objectMatrix, this.rotationAngle);
        mat4.rotateY(objectMatrix, objectMatrix, this.orbitAngle);
        mat4.translate(objectMatrix, objectMatrix, [this.x, this.y, this.z]);
    
        if (this.isUranus) {
            mat4.rotateZ(objectMatrix, objectMatrix, Math.PI * 98 / 180);
        }
        mat4.multiply(perspectiveMatrix, perspectiveMatrix, objectMatrix);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        const aPosition = gl.getAttribLocation(program, 'aPosition');
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aTexCoord);
    
        const uMatrix = gl.getUniformLocation(program, 'uMatrix');
        gl.uniformMatrix4fv(uMatrix, false, perspectiveMatrix);
    
        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            const uSampler = gl.getUniformLocation(program, 'uSampler');
            gl.uniform1i(uSampler, 0);
        }
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }    
}
