import { CGFobject, CGFtexture, CGFappearance } from '../lib/CGF.js';
import { MyCircularPlane } from './MyCircularPlane.js';

export class MyLake extends CGFobject {
    constructor(scene, size = 10) {
        super(scene);
        this.size = size;
        this.circularPlane = new MyCircularPlane(scene, this.size, 64, 16);
        
        this.waterAppearance = new CGFappearance(scene);
        this.waterTexture = new CGFtexture(scene, 'images/waterTex.jpg');
        this.waterAppearance.setTexture(this.waterTexture);
        this.waterAppearance.setTextureWrap('REPEAT', 'REPEAT');
        
        this.waterAppearance.setAmbient(0.3, 0.3, 0.3, 1.0);
        this.waterAppearance.setDiffuse(0.7, 0.7, 0.7, 1.0);
        this.waterAppearance.setSpecular(0.9, 0.9, 0.9, 1.0);
        this.waterAppearance.setShininess(100);
    }

    display() {
        this.scene.pushMatrix();
        this.waterAppearance.apply();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.circularPlane.display();
        this.scene.popMatrix();
    }
}