import { CGFobject } from '../lib/CGF.js';
import { MyTree } from './MyTree.js';

export class MyForest2 extends CGFobject {
    constructor(scene, rows, cols, width, depth) {
        super(scene);
        this.rows = rows;
        this.cols = cols;
        this.width = width;
        this.depth = depth;

        this.trees = [];
        this.offsets = []; // Store random offsets for consistent positions

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // Generate random parameters for each tree
                const inclination = Math.random() * 15; // Random inclination between 0 and 15 degrees
                const rotationAxis = Math.random() > 0.5 ? 'X' : 'Z'; // Random rotation axis
                const trunkRadius = 0.3 + Math.random() * 0.2; // Random trunk radius between 0.3 and 0.5
                const treeHeight = 4 + Math.random() * 2; // Random tree height between 4 and 6
                const foliageColor = [0, 0.6 + Math.random() * 0.4, 0]; // Random green shade

                this.trees.push(new MyTree(scene, inclination, rotationAxis, trunkRadius, treeHeight, foliageColor));

                // Generate and store random offsets
                const xOffset = (Math.random() - 0.5) * (width / cols) * 0.3; // Offset within 30% of spacing
                const zOffset = (Math.random() - 0.5) * (depth / rows) * 0.3;
                this.offsets.push({ x: xOffset, z: zOffset });
            }
        }
    }

    display() {
        const xSpacing = this.width / (this.cols - 1);
        const zSpacing = this.depth / (this.rows - 1);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const index = i * this.cols + j;
                const offset = this.offsets[index]; // Use stored offsets

                this.scene.pushMatrix();
                this.scene.translate(
                    -this.width / 2 + j * xSpacing + offset.x,
                    0,
                    -this.depth / 2 + i * zSpacing + offset.z
                );
                this.trees[index].display();
                this.scene.popMatrix();
            }
        }
    }
}