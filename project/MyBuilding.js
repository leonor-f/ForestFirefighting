import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';
import { MyWindow } from './MyWindow.js';
import { MyCircle } from './MyCircle.js';

export class MyBuilding extends CGFobject {
    constructor(scene, width, floors, windowsPerFloor, windowTexture, color) {
        super(scene);

        this.scene = scene;
        this.width = width;
        this.lateralFloors = floors;
        this.centralFloors = floors + 1;
        this.windowsPerFloor = windowsPerFloor;
        this.color = color;

        // Module dimensions
        this.centralWidth = width * 0.4;
        this.lateralWidth = this.centralWidth * 0.75;
        this.floorHeight = 12;
        this.depth = this.centralWidth * 0.75;

        // Materials
        this.wallMaterial = new CGFappearance(scene);
        this.wallMaterial.setAmbient(...color, 1);

        this.signMaterial = new CGFappearance(scene);
        this.signMaterial.setTexture(new CGFtexture(scene, 'images/bombeiros.png'));

        this.doorMaterial = new CGFappearance(scene);
        this.doorMaterial.setTexture(new CGFtexture(scene, 'images/door.png'));

        this.helipadMaterial = new CGFappearance(scene);
        this.helipadMaterial.setTexture(new CGFtexture(scene, 'images/helipad.png'));

        // Objects
        this.window = new MyWindow(scene, windowTexture);
        this.plane = new MyPlane(scene, 1);
        this.circle = new MyCircle(scene, 40);
    }

    displayModule(width, floors, hasGroundFloorWindows = true) {
        const depth = this.depth;
        const floorHeight = this.floorHeight;
        const totalHeight = floors * floorHeight;
        const spacing = width / (this.windowsPerFloor + 1);

        // Front wall
        this.wallMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, totalHeight/2, 0);
        this.scene.scale(width, totalHeight, 1);
        this.plane.display();
        this.scene.popMatrix();

        // Back wall
        this.wallMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, totalHeight/2, -depth);
        this.scene.scale(width, totalHeight, 1);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.plane.display();
        this.scene.popMatrix();

        // Side walls
        const sides = [-1, 1];
        for (let s of sides) {
            this.scene.pushMatrix();
            this.scene.translate(s * width/2, totalHeight/2, -depth/2);
            this.scene.rotate(s * Math.PI/2, 0, 1, 0);
            this.scene.scale(depth, totalHeight, 1);
            this.plane.display();
            this.scene.popMatrix();
        }

        // Roof
        this.scene.pushMatrix();
        this.scene.translate(0, totalHeight, -depth/2);
        this.scene.scale(width, 1, depth);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.wallMaterial.apply();
        this.plane.display();
        this.scene.popMatrix();

        // Floor
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -depth/2);
        this.scene.scale(width, 1, depth);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.plane.display();
        this.scene.popMatrix();
        
        // Windows
        for (let floor = 0; floor < floors; floor++) {
            if (floor === 0 && !hasGroundFloorWindows) continue;

            for (let i = 0; i < this.windowsPerFloor; i++) {
                this.scene.pushMatrix();
                this.scene.translate(
                    -width / 2 + spacing * (i + 1),
                    floor * floorHeight + floorHeight/2,
                    0.05
                );
                this.scene.scale(6, 6, 1);
                this.scene.translate(0, 0, 0.5); // Slightly in front of the wall
                this.window.display();
                this.scene.popMatrix();
            }
        }

        // Door and sign (only for central module)
        if (!hasGroundFloorWindows) {
            // Door
            this.scene.pushMatrix();
            this.scene.translate(0, floorHeight/2-1, 0.8);
            this.scene.scale(width * 0.25, floorHeight * 0.8, 1);
            this.doorMaterial.apply();
            this.plane.display();
            this.scene.popMatrix();

            // Sign "BOMBEIROS"
            this.scene.pushMatrix();
            this.scene.translate(0, floorHeight, 0.5);
            this.scene.scale(width * 0.5, floorHeight * 0.25, 1);
            this.signMaterial.apply();
            this.plane.display();
            this.scene.popMatrix();
        }

        // Helipad
        if (floors === this.centralFloors) {
            this.scene.pushMatrix();
            this.scene.translate(0, totalHeight + 0.1, -depth/2);
            this.scene.scale(width * 0.2, 1, width * 0.2);
            this.helipadMaterial.apply();
            this.circle.display();
            this.scene.popMatrix();
        }
    }

    display() {
        // Left module
        this.scene.pushMatrix();
        this.scene.translate(
            -this.centralWidth / 2 - this.lateralWidth / 2,
            0,
            0
        );
        this.displayModule(this.lateralWidth, this.lateralFloors);
        this.scene.popMatrix();

        // Central module
        this.displayModule(this.centralWidth, this.centralFloors, false);

        // Right module
        this.scene.pushMatrix();
        this.scene.translate(
            this.centralWidth / 2 + this.lateralWidth / 2,
            0,
            0
        );
        this.displayModule(this.lateralWidth, this.lateralFloors);
        this.scene.popMatrix();
    }
}