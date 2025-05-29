import { CGFobject } from '../lib/CGF.js';

export class MyPyramid extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {number} slices - Number of divisions around the base
     * @param {number} stacks - Number of divisions along the height
     */
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        this.colors = [];
        
        const deltaAng = (2 * Math.PI) / this.slices;

        // Top (peak) of the pyramid
        this.vertices.push(0, 0, 1); // top
        this.normals.push(0, 0, 1); // normal to the top
        this.texCoords.push(0.5, 1); // texture's center at the top
        this.colors.push(1.0, 0.0, 0.0, 1.0); // vermelho intenso no topo

        // Base
        for (let slice = 0; slice <= this.slices; slice++) {
            const ang = slice * deltaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);
            this.vertices.push(x, y, 0);
            this.normals.push(x, y, 0); // radial normal
            this.texCoords.push((x + 1) / 2, (y + 1) / 2 * 0);
            // Interpola cor entre amarelo e vermelho na base
            const t = slice / this.slices;
            // t=0 amarelo, t=1 vermelho
            const r = 1.0;
            const g = 1.0 - 0.7 * t; // de 1.0 (amarelo) até 0.3 (vermelho)
            const b = 0.0;
            this.colors.push(r, g, b, 1.0);
        }

        // Indexes for the side faces of the pyramid
        for (let slice = 0; slice < this.slices; slice++) {
            this.indices.push(0, slice + 1, slice + 2);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}