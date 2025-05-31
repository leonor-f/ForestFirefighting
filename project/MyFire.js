import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyPyramid } from './MyPyramid.js';

export class MyFire extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Referência ao objeto MyScene
     * @param {number} x - Posição X do incêndio
     * @param {number} y - Posição Y do incêndio
     * @param {number} z - Posição Z do incêndio
     * @param {number} numFlames - Número de labaredas a serem geradas
     */
    constructor(scene, x, y, z, numFlames) {
        super(scene);

        this.x = x;
        this.y = y;
        this.z = z;
        this.numFlames = numFlames;

        this.flames = [];
        this.flamePhases = [];
        this.flameBaseHeights = [];
        this.flameBaseBases = [];
        this.flameBaseAngles = [];
        this.flameRotationSpeeds = [];
        this.fireAnimationSpeed = 1.2; // Movimento lento e visível
        this.time = 0;
        this.initFlames();
        this.initMaterials();
    }

    initFlames() {
        // Cria pirâmides de tamanhos e posições aleatórias para simular as labaredas
        for (let i = 0; i < this.numFlames; i++) {
            const height = 2 + Math.random() * 25;
            const base = 2 + Math.random() * 5;
            const offsetX = (Math.random() - 0.5) * 1.2;
            const offsetZ = (Math.random() - 0.5) * 1.2;
            const pyramid = new MyPyramid(this.scene, 12, 1);
            this.flames.push({ height, base, offsetX, offsetZ, pyramid });
            this.flameBaseHeights.push(height);
            this.flameBaseBases.push(base);
            this.flamePhases.push(Math.random() * Math.PI * 2);
            this.flameBaseAngles.push(Math.random() * Math.PI * 2);
            this.flameRotationSpeeds.push(0.8 + Math.random() * 0.07);
        }
    }

    initMaterials() {
        // Material para as labaredas com textura de fogo
        this.fireMaterial = new CGFappearance(this.scene);
        this.fireMaterial.setAmbient(1.0, 1.0, 1.0, 1.0);
        this.fireMaterial.setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.fireMaterial.setSpecular(0.0, 0.0, 0.0, 1.0);
        this.fireMaterial.setShininess(10.0);
        this.fireMaterial.loadTexture('images/fire.png');
        this.fireMaterial.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y, this.z);

        // Enable blending for transparency
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA, this.scene.gl.ONE, this.scene.gl.ONE);

        this.fireMaterial.apply();

        for (let i = 0; i < this.flames.length; i++) {
            const { height, base, offsetX, offsetZ, pyramid } = this.flames[i];
            this.scene.pushMatrix();
            this.scene.translate(offsetX, 0, offsetZ);
            //this.scene.rotate(this.flameBaseAngles[i], 0, 1, 0);
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.scene.scale(base, base, height);
            pyramid.display();
            this.scene.popMatrix();
        }

        // Disable blending after rendering
        this.scene.gl.disable(this.scene.gl.BLEND);

        this.scene.popMatrix();
    }
}