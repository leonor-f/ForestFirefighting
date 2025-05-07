import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyCylinder } from './MyCylinder.js';
import { MyPyramid } from './MyPyramid.js';

export class MyTree2 extends CGFobject {
    constructor(scene, inclination = 0, rotationAxis = 'X', trunkRadius = null, treeHeight = null, foliageColor = null) {
        super(scene);

        // Generate random values if not provided
        this.inclination = inclination;
        this.rotationAxis = rotationAxis.toUpperCase();
        this.trunkRadius = trunkRadius || (0.3 + Math.random() * 0.2); // Random trunk radius between 0.3 and 0.5
        this.treeHeight = treeHeight || (4 + Math.random() * 2); // Random tree height between 4 and 6
        this.foliageColor = foliageColor || [0, 0.6 + Math.random() * 0.4, 0]; // Random green shade

        this.trunk = new MyCylinder(scene, 16, 8);
        this.foliage = new MyPyramid(scene, 4);

        this.trunkMaterial = new CGFappearance(scene);
        this.trunkMaterial.setAmbient(0.4, 0.2, 0, 1); // Brown color for the trunk

        this.foliageMaterial = new CGFappearance(scene);
        this.foliageMaterial.setAmbient(...this.foliageColor, 1); // Custom foliage color
    }

    display() {
        const trunkHeight = this.treeHeight * 0.2; // Trunk is 20% of the tree height
        const foliageHeight = this.treeHeight * 0.8; // Foliage is 80% of the tree height
        const numPyramids = Math.ceil(foliageHeight / 1.5); // Number of pyramids based on foliage height
        const pyramidBaseRadius = this.trunkRadius * 1.5; // Base radius of the pyramids

        // Apply inclination
        this.scene.pushMatrix();
        if (this.rotationAxis === 'X') {
            this.scene.rotate((this.inclination * Math.PI) / 180, 1, 0, 0);
        } else if (this.rotationAxis === 'Z') {
            this.scene.rotate((this.inclination * Math.PI) / 180, 0, 0, 1);
        }

        // Display trunk
        this.scene.pushMatrix();
        this.trunkMaterial.apply();
        this.scene.scale(this.trunkRadius, trunkHeight, this.trunkRadius);
        this.trunk.display();
        this.scene.popMatrix();

        // Display foliage
        this.foliageMaterial.apply();
        for (let i = 0; i < numPyramids; i++) {
            this.scene.pushMatrix();
            this.scene.translate(0, trunkHeight + i * (foliageHeight / numPyramids), 0);
            this.scene.scale(pyramidBaseRadius * (1 - i / numPyramids), foliageHeight / numPyramids, pyramidBaseRadius * (1 - i / numPyramids));
            this.foliage.display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }
}