import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';

export class MyWindow extends CGFobject {
    constructor(scene, texturePath) {
        super(scene);
        this.plane = new MyPlane(scene, 1);
        this.appearance = new CGFappearance(scene);
        this.texture = new CGFtexture(scene, texturePath);
        this.appearance.setTexture(this.texture);
        this.appearance.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.appearance.apply();
        this.plane.display();
    }
}