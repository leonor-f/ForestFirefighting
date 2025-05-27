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
        
        const deltaAng = (2 * Math.PI) / this.slices;

        // Top (peak) of the pyramid
        this.vertices.push(0, 0, 1); // top
        this.normals.push(0, 0, 1); // normal to the top
        this.texCoords.push(0.5, 1); // texture's center at the top

        // Base
        for (let slice = 0; slice <= this.slices; slice++) {
            const ang = slice * deltaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);
            this.vertices.push(x, y, 0);
            this.normals.push(x, y, 0); // radial normal
            // Mapping to fill all the texture: base goes from (0,0) to (1,0)
            this.texCoords.push((x + 1) / 2, (y + 1) / 2 * 0); // (x+1)/2 covers [0,1] at X, Y always 0
        }

        // Indexes for the side faces of the pyramid
        for (let slice = 0; slice < this.slices; slice++) {
            this.indices.push(0, slice + 1, slice + 2);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}