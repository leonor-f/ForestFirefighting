import { CGFobject } from '../lib/CGF.js';

export class MySphere extends CGFobject {
    constructor(scene, slices, stacks, reverse = false) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.reverse = reverse; // New parameter to control face inversion
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const radius = 1;
        const pi = Math.PI;
        const dTheta = 2 * pi / this.slices;
        const dPhi = pi / (2 * this.stacks);

        for (let stack = -this.stacks; stack <= this.stacks; ++stack) {
            const phi = stack * dPhi;
            const y = radius * Math.sin(phi);
            const r = radius * Math.cos(phi);

            for (let slice = 0; slice <= this.slices; ++slice) {
                const theta = slice * dTheta;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);

                this.vertices.push(x, y, z);
                const length = Math.sqrt(x * x + y * y + z * z);
                this.normals.push(x / length, y / length, z / length);
                
                this.texCoords.push(1 - (slice / this.slices), 0.5 - (stack / (2 * this.stacks)));
            }
        }

        for (let stack = 0; stack < 2 * this.stacks; ++stack) {
            for (let slice = 0; slice < this.slices; ++slice) {
                const first = stack * (this.slices + 1) + slice;
                const second = first + this.slices + 1;

                if (this.reverse) {
                    // Reverse the order of indices for inverted faces
                    this.indices.push(first, second + 1, second);
                    this.indices.push(first, first + 1, second + 1);
                } else {
                    // Two triangles per quad — CCW
                    this.indices.push(first, second, second + 1);
                    this.indices.push(first, second + 1, first + 1);
                }
            }
        }

        if (this.reverse) {
            // Reverse normals for inverted faces
            this.normals = this.normals.map(n => -n);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
