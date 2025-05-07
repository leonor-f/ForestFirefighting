import { CGFobject } from '../lib/CGF.js';
import { MyTree } from './MyTree.js';

export class MyForest extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {number} rows - Number of rows in the forest grid
     * @param {number} cols - Number of columns in the forest grid
     * @param {number} areaWidth - Width of the forest area
     * @param {number} areaDepth - Depth of the forest area
     */
    constructor(scene, rows, cols, areaWidth, areaDepth, buildingW) {
        super(scene);
        this.rows = rows;
        this.cols = cols;
        this.areaWidth = areaWidth;
        this.areaDepth = areaDepth;
        this.buildingW = buildingW;
        
        this.trees = [];
        this.initForest();
    }
    
    initForest() {
        const buildingWidth = this.buildingW;
        const buildingDepth = buildingWidth * 0.4 * 0.75;
        const rowSpacing = this.areaWidth / (this.rows + 1);
        const colSpacing = this.areaDepth / (this.cols + 1);

        // Define building area to avoid placing trees inside it
        const buildingX = 0; // Building center X-coordinate
        const buildingZ = 0; // Building center Z-coordinate

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Calculate base position
                let x = -this.areaWidth / 2 + (col + 1) * colSpacing;
                let z = -this.areaDepth / 2 + (row + 1) * rowSpacing;

                // Add random offset (10% of spacing)
                const maxOffset = Math.min(rowSpacing, colSpacing) * 0.1;
                x += (Math.random() * 2 - 1) * maxOffset;
                z += (Math.random() * 2 - 1) * maxOffset;

                // Skip trees inside the building area
                const halfBuildingWidth = buildingWidth / 2;
                const halfBuildingDepth = buildingDepth / 2;
                if (
                    x > buildingX - halfBuildingWidth &&
                    x < buildingX + halfBuildingWidth &&
                    z > buildingZ - halfBuildingDepth &&
                    z < buildingZ + halfBuildingDepth
                ) {
                    continue;
                }

                // Generate random tree parameters
                const trunkRadius = 0.5 + Math.random() * 1.5;
                const treeHeight = 10 + Math.random() * 20;
                const tiltAngle = Math.random() * 15; // Up to 15 degrees tilt
                const tiltAxis = Math.random() > 0.5 ? 'x' : 'z';

                // Random green color (mostly green with some variation)
                const green = 0.3 + Math.random() * 0.5;
                const red = Math.random() * 0.2;
                const blue = Math.random() * 0.2;
                const foliageColor = [red, green, blue];

                // Create tree
                const tree = new MyTree(
                    this.scene,
                    trunkRadius,
                    treeHeight,
                    tiltAngle,
                    tiltAxis,
                    foliageColor
                );

                // Store tree with its position
                this.trees.push({
                    tree: tree,
                    x: x,
                    z: z
                });
            }
        }
    }
    
    display() {
        this.scene.pushMatrix();
        
        for (const treeData of this.trees) {
            this.scene.pushMatrix();
            this.scene.translate(treeData.x, 0, treeData.z); // Ensure trees are placed on the ground (y = 0)
            
            // Display shadow
            treeData.tree.displayShadow();

            // Display tree
            treeData.tree.display();
            this.scene.popMatrix();
        }
        
        this.scene.popMatrix();
    }
}