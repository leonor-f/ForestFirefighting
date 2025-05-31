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
        this.fireAnimationSpeed = 20; // Movimento rápido
        this.isExtinguished = false;
        this.time = 0;
        this.initFlames();
        this.initMaterials();
    }

    initFlames() {
        // Cria pirâmides de tamanhos e posições aleatórias para simular as labaredas
        for (let i = 0; i < this.numFlames; i++) {
            const height = 2 + Math.random() * 30;
            const base = 2 + Math.random() * 5;
            const offsetX = (Math.random() - 0.5) * 1.2;
            const offsetZ = (Math.random() - 0.5) * 1.2;
            const pyramid = new MyPyramid(this.scene, 8, 1);
            // Parâmetros para oscilação lateral
            const sideOscAmp = 0.3 + Math.random() * 0.25; // amplitude lateral
            const sideOscFreq = 0.7 + Math.random() * 0.25; // frequência lateral
            const sideOscPhase = Math.random() * Math.PI * 2;
            // Parâmetros para inclinação lateral
            const tiltAmp = 2 + Math.random() * 6; // 2 a 8 graus de inclinação
            const tiltPhase = Math.random() * Math.PI * 2;
            this.flames.push({ height, base, offsetX, offsetZ, pyramid, sideOscAmp, sideOscFreq, sideOscPhase, tiltAmp, tiltPhase });
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
    
    update(delta_t) {
        // delta_t em ms, converter para segundos
        const dt = (delta_t || 0) * 0.001;
        this.time += dt;
        for (let i = 0; i < this.flames.length; i++) {
            const phase = this.flamePhases[i];
            const baseHeight = this.flameBaseHeights[i];
            this.flames[i].height = baseHeight + 3 * Math.sin(this.time * this.fireAnimationSpeed * 0.1 + phase);
            this.flameBaseAngles[i] += this.flameRotationSpeeds[i] * dt;
            if (this.flameBaseAngles[i] > Math.PI * 2) this.flameBaseAngles[i] -= Math.PI * 2;
            // Inclinação lateral (em Z, mais rápida)
            this.flames[i].tiltValue = this.flames[i].tiltAmp * Math.sin(this.time * this.flames[i].sideOscFreq * 3 + this.flames[i].tiltPhase);
        }
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y, this.z);

        // Enable blending for transparency
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA, this.scene.gl.ONE, this.scene.gl.ONE);

        this.fireMaterial.apply();
        for (let i = 0; i < this.flames.length; i++) {
            const { height, base, offsetX, offsetZ, pyramid, sideOscValue, tiltValue } = this.flames[i];
            this.scene.pushMatrix();
            this.scene.translate(offsetX + (sideOscValue || 0), 0, offsetZ);
            // Inclinação lateral (em Z)
            this.scene.rotate((tiltValue || 0) * Math.PI / 180, 0, 0, 1);
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.scene.scale(base, base, height);
            pyramid.display();
            this.scene.popMatrix();
        }

        // Disable blending after rendering
        this.scene.gl.disable(this.scene.gl.BLEND);

        this.scene.popMatrix();
    }

    extinguish() {
        this.isExtinguished = true;
        console.log(`Fire at position (${this.x}, ${this.z}) has been extinguished!`);
    }
    reignite() {
        this.isExtinguished = false;
        console.log(`Fire at position (${this.x}, ${this.z}) has been reignited!`);
    }
}