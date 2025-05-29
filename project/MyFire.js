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
        this.fireAnimationSpeed = 0.2; // Movimento lento e visível
        this.time = 0;
        this.initFlames();
        this.initMaterials();
    }

    initFlames() {
        // Cria pirâmides de tamanhos e posições aleatórias para simular as labaredas
        for (let i = 0; i < this.numFlames; i++) {
            const height = 2 + Math.random() * 25;
            const base = 2 + Math.random() * 10;
            const offsetX = (Math.random() - 0.5) * 1.2;
            const offsetZ = (Math.random() - 0.5) * 1.2;
            const pyramid = new MyPyramid(this.scene, 6, 1);
            this.flames.push({ height, base, offsetX, offsetZ, pyramid });
            this.flameBaseHeights.push(height);
            this.flameBaseBases.push(base);
            this.flamePhases.push(Math.random() * Math.PI * 2);
            this.flameBaseAngles.push(Math.random() * Math.PI * 2);
            this.flameRotationSpeeds.push(0.8 + Math.random() * 0.07);
        }
    }

    update(delta_t) {
        // delta_t em ms, converter para segundos
        const dt = (delta_t || 0) * 0.001;
        this.time += dt;
        for (let i = 0; i < this.flames.length; i++) {
            // Oscila a altura e base das labaredas suavemente
            const phase = this.flamePhases[i];
            const baseHeight = this.flameBaseHeights[i];
            const baseBase = this.flameBaseBases[i];
            // Oscilação lenta e suave
            this.flames[i].height = baseHeight + 6 * Math.sin(this.time * this.fireAnimationSpeed + phase);
            this.flames[i].base = baseBase + 2 * Math.sin(this.time * this.fireAnimationSpeed * 0.7 + phase);
            // Atualiza ângulo de rotação suavemente
            this.flameBaseAngles[i] += this.flameRotationSpeeds[i] * dt;
            if (this.flameBaseAngles[i] > Math.PI * 2) this.flameBaseAngles[i] -= Math.PI * 2;
        }
    }

    initMaterials() {
        // Material para as labaredas (vermelho/laranja/amarelo)
        this.fireMaterial = new CGFappearance(this.scene);
        this.fireMaterial.setAmbient(1.0, 0.4, 0.0, 1.0);
        this.fireMaterial.setDiffuse(1.0, 0.6, 0.0, 1.0);
        this.fireMaterial.setSpecular(1.0, 1.0, 0.0, 1.0);
        this.fireMaterial.setShininess(10.0);
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y, this.z);
        this.fireMaterial.apply();
        for (let i = 0; i < this.flames.length; i++) {
            const { height, base, offsetX, offsetZ, pyramid } = this.flames[i];
            // Apenas algumas labaredas externas são vermelhas translúcidas
            if (i % 3 === 0) {
                this.scene.pushMatrix();
                this.scene.translate(offsetX, 0, offsetZ);
                this.scene.rotate(this.flameBaseAngles[i], 0, 1, 0);
                this.scene.rotate(-Math.PI/2, 1, 0, 0);
                this.scene.scale(base * 1.18, base * 1.18, height * 1.18);
                const redMaterial = new CGFappearance(this.scene);
                redMaterial.setAmbient(1.0, 0.3, 0.2, 0.18); // vermelho claro, alpha baixo
                redMaterial.setDiffuse(1.0, 0.3, 0.2, 0.18);
                redMaterial.setSpecular(1.0, 0.3, 0.2, 0.18);
                redMaterial.setShininess(10.0);
                redMaterial.apply();
                // Ativa blending para transparência
                this.scene.gl.enable(this.scene.gl.BLEND);
                this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
                this.scene.gl.depthMask(false);
                pyramid.display();
                this.scene.gl.depthMask(true);
                this.scene.gl.disable(this.scene.gl.BLEND);
                this.scene.popMatrix();
            }
            // Camada normal (degradê amarelo-vermelho)
            this.scene.pushMatrix();
            this.scene.translate(offsetX, 0, offsetZ);
            this.scene.rotate(this.flameBaseAngles[i], 0, 1, 0);
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.scene.scale(base, base, height);
            this.fireMaterial.apply();
            pyramid.display();
            // Núcleo brilhante (menor, amarelo translúcido)
            this.scene.pushMatrix();
            this.scene.scale(0.28, 0.28, 0.5);
            this.scene.translate(0, 0, 0.18);
            const coreMaterial = new CGFappearance(this.scene);
            coreMaterial.setAmbient(1.0, 0.9, 0.2, 0.5);
            coreMaterial.setDiffuse(1.0, 0.9, 0.2, 0.5);
            coreMaterial.setSpecular(1.0, 0.9, 0.2, 0.5);
            coreMaterial.setShininess(10.0);
            coreMaterial.apply();
            this.scene.gl.enable(this.scene.gl.BLEND);
            this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
            pyramid.display();
            this.scene.gl.disable(this.scene.gl.BLEND);
            this.scene.popMatrix();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }
}