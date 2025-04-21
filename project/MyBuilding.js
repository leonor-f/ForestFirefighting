import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';
import { MyWindow } from './MyWindow.js';
import { MyCircle } from './MyCircle.js';

export class MyBuilding extends CGFobject {
    constructor(scene, width, floors, windowsPerFloor, windowTexture, color) {
        super(scene);

        this.scene = scene;
        this.width = width;
        this.floors = floors;
        this.windowsPerFloor = windowsPerFloor;
        this.color = color;

        // Dimensões dos módulos
        this.centralWidth = width / 2;
        this.lateralWidth = this.centralWidth * 0.75;
        this.lateralFloors = floors - 1;
        this.floorHeight = 10;
        this.depth = this.centralWidth * 0.75;

        // Materiais
        this.wallMaterial = new CGFappearance(scene);
        this.wallMaterial.setAmbient(...color, 1);

        this.signMaterial = new CGFappearance(scene);
        this.signMaterial.setTexture(new CGFtexture(scene, 'images/bombeiros.png'));

        this.doorMaterial = new CGFappearance(scene);
        this.doorMaterial.setTexture(new CGFtexture(scene, 'images/door.png'));

        this.helipadMaterial = new CGFappearance(scene);
        this.helipadMaterial.setTexture(new CGFtexture(scene, 'images/helipad.png'));

        // Objetos
        this.window = new MyWindow(scene, windowTexture);
        this.plane = new MyPlane(scene, 1);
        this.circle = new MyCircle(scene, 40);
    }

    displayModule(width, floors, hasGroundFloorWindows = true) {
        const spacing = width / (this.windowsPerFloor + 1);

        // Parede frontal
        this.wallMaterial.apply();
        this.scene.pushMatrix();
        this.scene.scale(width, floors * this.floorHeight, 1);
        this.plane.display();
        this.scene.popMatrix();

        // Janelas
        for (let floor = 0; floor < floors; floor++) {
            if (floor === 0 && !hasGroundFloorWindows) continue;

            for (let i = 0; i < this.windowsPerFloor; i++) {
                this.scene.pushMatrix();
                this.scene.translate(
                    -width / 2 + spacing * (i + 1),
                    floor * this.floorHeight - this.floorHeight,
                    0.02
                );
                this.scene.scale(6, 6, 1);
                this.window.display();
                this.scene.popMatrix();
            }
        }

        // Porta e letreiro (só módulo central)
        if (!hasGroundFloorWindows) {
            // Porta
            this.scene.pushMatrix();
            this.scene.translate(0, -width / 2.7, 0.02);
            this.scene.scale(width / 4, this.floorHeight, 1);
            this.doorMaterial.apply();
            this.plane.display();
            this.scene.popMatrix();

            // Letreiro "BOMBEIROS"
            this.scene.pushMatrix();
            this.scene.translate(0, -this.floorHeight + this.floorHeight / 3, 0.02);
            this.scene.scale(width / 2, this.floorHeight / 2, 2);
            this.signMaterial.apply();
            this.plane.display();
            this.scene.popMatrix();
        }

        // Parede traseira
        this.wallMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, floors * this.floorHeight / 2, -this.depth);
        this.scene.scale(width, floors * this.floorHeight, 1);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.plane.display();
        this.scene.popMatrix();

        // Laterais
        const sides = [-1, 1];
        for (let s of sides) {
            this.scene.pushMatrix();
            this.scene.translate(s * width / 2, floors * this.floorHeight / 2, -this.depth / 2);
            this.scene.scale(this.depth, floors * this.floorHeight, 1);
            this.scene.rotate(s * Math.PI / 2, 0, 1, 0);
            this.plane.display();
            this.scene.popMatrix();
        }

        // Telhado
        this.scene.pushMatrix();
        this.scene.translate(0, floors * this.floorHeight, -this.depth / 2);
        this.scene.scale(width, this.depth, 1);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.wallMaterial.apply();
        this.plane.display();
        this.scene.popMatrix();
    }

    display() {
        const centerZ = 0;

        // Módulo esquerdo
        this.scene.pushMatrix();
        this.scene.translate(
            -this.centralWidth / 2 - this.lateralWidth / 2,
            this.lateralFloors * this.floorHeight / 2,
            centerZ
        );
        this.displayModule(this.lateralWidth, this.lateralFloors);
        this.scene.popMatrix();

        // Módulo central
        this.scene.pushMatrix();
        this.scene.translate(0, this.floors * this.floorHeight / 2, centerZ);
        this.displayModule(this.centralWidth, this.floors, false);
        this.scene.popMatrix();

        // Módulo direito
        this.scene.pushMatrix();
        this.scene.translate(
            this.centralWidth / 2 + this.lateralWidth / 2,
            this.lateralFloors * this.floorHeight / 2,
            centerZ
        );
        this.displayModule(this.lateralWidth, this.lateralFloors);
        this.scene.popMatrix();

        // Heliporto
        this.scene.pushMatrix();
        this.scene.translate(0, this.floors * this.floorHeight + 0.01, centerZ - this.depth / 4);
        this.scene.scale(this.centralWidth / 5.5, 1, this.centralWidth / 5.5);
        this.helipadMaterial.apply();
        this.circle.display();
        this.scene.popMatrix();
    }
}
