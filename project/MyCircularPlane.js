import { CGFobject } from '../lib/CGF.js';

export class MyCircularPlane extends CGFobject {
    constructor(scene, radius, slices, rings) {
        super(scene);
        this.radius = radius;
        this.slices = slices; // divisions around circumference
        this.rings = rings;   // divisions from center to edge
        
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        // Center vertex
        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5, 0.5);
        
        // Generate vertices in rings
        for (let ring = 1; ring <= this.rings; ring++) {
            const ringRadius = (ring / this.rings) * this.radius;
            
            for (let slice = 0; slice < this.slices; slice++) {
                const angle = (slice * 2 * Math.PI) / this.slices;
                const x = ringRadius * Math.cos(angle);
                const y = ringRadius * Math.sin(angle);
                
                this.vertices.push(x, y, 0);
                this.normals.push(0, 0, 1);
                
                // Texture coordinates from center (0.5,0.5) to edge
                const texX = 0.5 + (x / this.radius) * 0.5;
                const texY = 0.5 + (y / this.radius) * 0.5;
                this.texCoords.push(texX, texY);
            }
        }
        
        // Generate indices
        // Center triangles (first ring)
        for (let slice = 0; slice < this.slices; slice++) {
            this.indices.push(0); // center
            this.indices.push(1 + slice);
            this.indices.push(1 + ((slice + 1) % this.slices));
        }
        
        // Ring triangles
        for (let ring = 1; ring < this.rings; ring++) {
            const currentRingStart = 1 + (ring - 1) * this.slices;
            const nextRingStart = 1 + ring * this.slices;
            
            for (let slice = 0; slice < this.slices; slice++) {
                const nextSlice = (slice + 1) % this.slices;
                
                // First triangle of quad
                this.indices.push(currentRingStart + slice);
                this.indices.push(nextRingStart + slice);
                this.indices.push(currentRingStart + nextSlice);
                
                // Second triangle of quad
                this.indices.push(currentRingStart + nextSlice);
                this.indices.push(nextRingStart + slice);
                this.indices.push(nextRingStart + nextSlice);
            }
        }
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}