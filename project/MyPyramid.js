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

        // Side vertices and normals for each stack
        const sideStart = 0; // agora começa em 0

        for (let stack = 1; stack <= this.stacks; stack++) {
            const z = stack / this.stacks;
            const scale = 1 - z;
            
            for (let slice = 0; slice <= this.slices; slice++) {
                const ang = slice * deltaAng;
                const x = Math.cos(ang) * scale;
                const y = Math.sin(ang) * scale;
                
                this.vertices.push(x, y, z);
                
                // Calculate normal (pointing outward)
                const normalX = Math.cos(ang);
                const normalY = Math.sin(ang);
                const normalZ = scale;
                const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
                
                this.normals.push(
                    normalX / length,
                    normalY / length,
                    normalZ / length
                );
                
                // Texture coordinates
                this.texCoords.push(
                    slice / this.slices,
                    z
                );
            }
        }
        
        // Side indices
        for (let stack = 0; stack < this.stacks; stack++) {
            const currentStackStart = sideStart + stack * (this.slices + 1);
            const nextStackStart = currentStackStart + this.slices + 1;
            
            for (let slice = 0; slice < this.slices; slice++) {
                this.indices.push(
                    currentStackStart + slice,
                    nextStackStart + slice,
                    currentStackStart + slice + 1
                );
                
                this.indices.push(
                    nextStackStart + slice,
                    nextStackStart + slice + 1,
                    currentStackStart + slice + 1
                );
            }
        }
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}