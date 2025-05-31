import { CGFobject } from '../lib/CGF.js';
import { MyTree } from './MyTree.js';
import { MyFire } from './MyFire.js';

export class MyForest extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {number} rows - Number of rows in the forest grid
     * @param {number} cols - Number of columns in the forest grid
     * @param {number} areaWidth - Width of the forest area
     * @param {number} areaDepth - Depth of the forest area
     * @param {number} buildingW - Width of the building area to avoid placing trees inside it
     */
    constructor(scene, rows, cols, areaWidth, areaDepth, buildingW) {
        super(scene);
        this.rows = rows;
        this.cols = cols;
        this.areaWidth = areaWidth;
        this.areaDepth = areaDepth;
        this.buildingW = buildingW;
        
        this.trees = [];
        this.fires = [];
        this.initForest();
        this.initFires();
    }
    
    initForest() {
        const buildingWidth = this.buildingW;
        const buildingDepth = buildingWidth * 0.4 * 0.75;
        // Define building area to avoid placing trees inside it
        const buildingX = -200; // Building center X-coordinate
        const buildingZ = -100; // Building center Z-coordinate

        // Tree positions generation with random distribution
        let positions = [];
        let minDist = Math.min(this.areaWidth, this.areaDepth) * 0.1;
        let maxDist = Math.min(this.areaWidth, this.areaDepth) * 0.8;
        let tries = 0;
        while (positions.length < this.rows * this.cols && tries < 2000) {
            let x = (Math.random() - 0.5) * (this.areaWidth - 16);
            let z = (Math.random() - 0.5) * (this.areaDepth - 16);
            let valid = true;
            for (let pos of positions) {
                let dx = x - pos.x;
                let dz = z - pos.z;
                let dist = Math.sqrt(dx*dx + dz*dz);
                if (dist < minDist || dist > maxDist) {
                    valid = false;
                    break;
                }
            }
            if (valid) positions.push({x, z});
            tries++;
        }
        for (let pos of positions) {
            // Skip trees inside the building area
            const halfBuildingWidth = buildingWidth / 2;
            const halfBuildingDepth = buildingDepth / 2;
            if (
                pos.x > buildingX - halfBuildingWidth &&
                pos.x < buildingX + halfBuildingWidth &&
                pos.z > buildingZ - halfBuildingDepth &&
                pos.z < buildingZ + halfBuildingDepth
            ) {
                continue;
            }

            // Limits the tree positions to the grass area
            const grassMargin = 8; // security margin to avoid trees too close to the edge
            const x = Math.max(-this.areaWidth/2 + grassMargin, Math.min(this.areaWidth/2 - grassMargin, pos.x));
            const z = Math.max(-this.areaDepth/2 + grassMargin, Math.min(this.areaDepth/2 - grassMargin, pos.z));

            // Generate random tree parameters
                const trunkRadius = 2 + Math.random() * 3;
                const treeHeight = 25 + Math.random() * 20;
                const tiltAngle = Math.random() * 10; // Up to 10 degrees tilt
                const tiltAxis = Math.random() > 0.5 ? 'x' : 'z';

            // Random foliage color: mostly green, but sometimes yellow-green
            let foliageColor;
            if (Math.random() < 0.35) {
                // 35% chance for yellow-green tones
                const green = 0.6 + Math.random() * 0.3; // 0.6 - 0.9
                const red = 0.5 + Math.random() * 0.3;   // 0.5 - 0.8
                const blue = Math.random() * 0.1;        // 0.0 - 0.1
                foliageColor = [red, green, blue];
            } else {
                // Mostly green with some variation
                const green = 0.3 + Math.random() * 0.5;
                const red = Math.random() * 0.2;
                const blue = Math.random() * 0.2;
                foliageColor = [red, green, blue];
            }

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

    initFires() {
        // Cria alguns incêndios em posições aleatórias da floresta
        const numFires = 7 + Math.floor(Math.random() * 3); // 7 a 9 incêndios
        for (let i = 0; i < numFires; i++) {
            // Posição aleatória dentro da área da floresta
            const x = (Math.random() - 0.5) * (this.areaWidth / 3 - 20);
            const z = (Math.random() - 0.5) * (this.areaDepth / 3 - 40);
            const fire = new MyFire(
                this.scene,
                x,
                0,
                z,
                11 + Math.floor(Math.random() * 5) // 11 a 15 labaredas
            );
            this.fires.push({
                fire: fire,
                x: x,
                z: z
            });
        }
    }
    
    extinguishFiresInRange(heliX, heliZ, radius) {
        let extinguishedCount = 0;
        
        for (const fireData of this.fires) {
            if (!fireData.fire.isExtinguished) {
                const distanceToFire = Math.sqrt(
                    Math.pow(heliX - fireData.x, 2) + 
                    Math.pow(heliZ - fireData.z, 2)
                );
                
                if (distanceToFire <= radius) {
                    fireData.fire.extinguish();
                    extinguishedCount++;
                }
            }
        }
        
        return extinguishedCount;
    }
    
    // Also modify the display method to only show active fires
    display() {
        this.scene.pushMatrix();
        // First draw the trees
        for (const treeData of this.trees) {
            this.scene.pushMatrix();
            this.scene.translate(treeData.x, 0, treeData.z);
            treeData.tree.displayShadow();
            treeData.tree.display();
            this.scene.popMatrix();
        }
        // Then draw only active fires
        for (const fireData of this.fires) {
            if (!fireData.fire.isExtinguished) {
                this.scene.pushMatrix();
                this.scene.translate(fireData.x, 0, fireData.z);
                fireData.fire.display();
                this.scene.popMatrix();
            }
        }
        this.scene.popMatrix();
    }

    update(delta_t) {
        for (const fireData of this.fires) {
            if (fireData.fire && typeof fireData.fire.update === 'function') {
                fireData.fire.update(delta_t);
            }
        }
    }
}