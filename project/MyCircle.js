import { CGFobject } from '../lib/CGF.js';

export class MyCircle extends CGFobject {
    constructor(scene, slices = 32) {
        super(scene);
        this.slices = slices;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        this.vertices.push(0, 0, 0); // center
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 0.5);

        for (let i = 0; i <= this.slices; i++) {
            const angle = (2 * Math.PI * i) / this.slices;
            const x = Math.cos(angle);
            const z = -Math.sin(angle);

            this.vertices.push(x, 0, z);
            this.normals.push(0, 1, 0);
            this.texCoords.push(0.5 + x / 2, 0.5 + z / 2);

            if (i > 0) {
                this.indices.push(0, i, i + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}