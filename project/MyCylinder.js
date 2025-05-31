import { CGFobject } from '../lib/CGF.js';

export class MyCylinder extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {number} slices - Number of divisions around the circumference
     * @param {number} stacks - Number of divisions along the height
     * @param {number} baseRadius - Radius at the base
     * @param {number} topRadius - Radius at the top
     * @param {number} height - Height of the cylinder
     */
    constructor(scene, slices, stacks, baseRadius, topRadius, height) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.baseRadius = baseRadius;
        this.topRadius = topRadius;
        this.height = height;
        
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        const deltaAng = (2 * Math.PI) / this.slices;
        const deltaHeight = this.height / this.stacks;
        const deltaRadius = (this.topRadius - this.baseRadius) / this.stacks;
        
        // Generate vertices, normals and texture coordinates
        for (let stack = 0; stack <= this.stacks; stack++) {
            const currentRadius = this.baseRadius + deltaRadius * stack;
            const currentHeight = deltaHeight * stack;
            
            for (let slice = 0; slice <= this.slices; slice++) {
                const ang = slice * deltaAng;
                const sinAng = Math.sin(ang);
                const cosAng = Math.cos(ang);
                
                // Vertex position
                this.vertices.push(
                    currentRadius * cosAng,
                    currentRadius * sinAng,
                    currentHeight
                );
                
                // Normal (pointing outward)
                this.normals.push(
                    cosAng,
                    sinAng,
                    0
                );
                
                // Texture coordinates
                this.texCoords.push(
                    slice / this.slices,
                    1 - stack / this.stacks
                );
            }
        }

        // Add vertices for top and bottom circle centers
        const topCenterIndex = this.vertices.length / 3;
        this.vertices.push(0, 1, 0); // Top center
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 0.5);

        const bottomCenterIndex = this.vertices.length / 3;
        this.vertices.push(0, 0, 0); // Bottom center
        this.normals.push(0, -1, 0);
        this.texCoords.push(0.5, 0.5);
        
        // Generate indices
        // Side faces
        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                const first = stack * (this.slices + 1) + slice;
                const second = first + this.slices + 1;
                
                // Counter-clockwise winding for outward-facing normals
                this.indices.push(first, first + 1, second);
                this.indices.push(second, first + 1, second + 1);
            }
        }

        // Top face triangles
        for (let slice = 0; slice < this.slices; slice++) {
            const topRingStart = (this.stacks) * (this.slices + 1);
            this.indices.push(topCenterIndex, topRingStart + slice, topRingStart + (slice + 1) % this.slices);
        }

        // Bottom face triangles
        for (let slice = 0; slice < this.slices; slice++) {
            this.indices.push(bottomCenterIndex, (slice + 1) % this.slices, slice);
        }
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}