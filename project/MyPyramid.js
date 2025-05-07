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
        
        // Base center vertex
        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, -1);
        this.texCoords.push(0.5, 0.5);
        
        // Base perimeter vertices
        for (let i = 0; i <= this.slices; i++) {
            const ang = i * deltaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);
            
            this.vertices.push(x, y, 0);
            this.normals.push(0, 0, -1);
            this.texCoords.push(0.5 + x * 0.5, 0.5 + y * 0.5);
        }
        
        // Base indices
        for (let i = 1; i <= this.slices; i++) {
            this.indices.push(0, i, i + 1);
        }
        
        // Side vertices and normals for each stack
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
        const baseCenterIndex = 0;
        const basePerimeterStart = 1;
        const sideStart = basePerimeterStart + this.slices + 1;
        
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