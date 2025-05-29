import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';

export class MyTriangle extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Referência ao objeto MyScene
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} z1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {number} z2 
     * @param {number} x3 
     * @param {number} y3 
     * @param {number} z3 
     */
    constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        super(scene);

        this.vertices = [
            x1, y1, z1,
            x2, y2, z2,
            x3, y3, z3
        ];
        this.indices = [0, 1, 2];
        this.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1];
        this.colors = [
            1.0, 1.0, 1.0, 1.0, // default white
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ];
        this.initBuffers();
    }

    setVertexColors(colors) {
        // colors: array de 3 arrays RGBA
        this.colors = [
            ...colors[0],
            ...colors[1],
            ...colors[2]
        ];
        this.initBuffers();
    }

    initBuffers() {
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
        if (this.colors) {
            // Buffer de vértices
            this.scene.gl.bindBuffer(this.scene.gl.ARRAY_BUFFER, this.glVertexBuffer);
            this.scene.gl.bufferData(this.scene.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.scene.gl.STATIC_DRAW);
            // Buffer de cores por vértice
            if (!this.glColorBuffer) {
                this.glColorBuffer = this.scene.gl.createBuffer();
            }
            this.scene.gl.bindBuffer(this.scene.gl.ARRAY_BUFFER, this.glColorBuffer);
            this.scene.gl.bufferData(this.scene.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.scene.gl.STATIC_DRAW);
        }
    }

    display() {
        // Ativa o atributo de cor por vértice se disponível
        if (this.colors && this.glColorBuffer) {
            const gl = this.scene.gl;
            const shader = this.scene.activeShader;
            // Tenta obter o local do atributo de cor
            const colorLoc = gl.getAttribLocation(shader.program, 'color');
            if (colorLoc !== -1) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.glColorBuffer);
                gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(colorLoc);
            }
        }
        super.display();
    }
}