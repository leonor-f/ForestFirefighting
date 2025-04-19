import {CGFappearance, CGFobject, CGFscene, CGFtexture} from '../lib/CGF.js';
import { MySphere } from './MySphere.js';

export class MyPanorama extends CGFobject{
    /**
     * 
     * @param {CGFscene} scene 
     * @param {CGFtexture} texture 
     */
    constructor(scene, texture) {
        super(scene);
        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(0,0,0,0);
        this.appearance.setDiffuse(0,0,0,0);
        this.appearance.setSpecular(0,0,0,0);
        this.appearance.setEmission(1,1,1,1);
        this.appearance.setTexture(texture);
        this.appearance.setTextureWrap('REPEAT', 'REPEAT');
        this.sphere = new MySphere(scene, 64, 32, 200, true);
    }

    display() {
        this.appearance.apply();

        this.scene.pushMatrix();
        const cameraPos = this.scene.camera.position;
        this.scene.translate(cameraPos[0], cameraPos[1], cameraPos[2]);
        this.sphere.display();
        this.scene.popMatrix();
    }
}