import { CGFobject } from '../lib/CGF.js';

export class MyPyramid extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {number} slices - Number of divisions around the base
     * @param {number} stacks - Number of divisions along the height
     */
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        const deltaAng = (2 * Math.PI) / this.slices;

        // --- NOVO MAPEAMENTO DE TEXTURA PARA FOLHAS ---
        // Topo (pico) da pirâmide
        this.vertices.push(0, 0, 1); // topo
        this.normals.push(0, 0, 1); // normal para cima
        this.texCoords.push(0.5, 1); // centro superior da textura

        // Base
        for (let slice = 0; slice <= this.slices; slice++) {
            const ang = slice * deltaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);
            this.vertices.push(x, y, 0);
            this.normals.push(x, y, 0); // normal radial
            // Mapeamento para ocupar toda a textura: base vai de (0,0) a (1,0)
            this.texCoords.push((x + 1) / 2, (y + 1) / 2 * 0); // (x+1)/2 cobre [0,1] em X, Y sempre 0
        }

        // Índices para as faces laterais
        for (let slice = 0; slice < this.slices; slice++) {
            this.indices.push(0, slice + 1, slice + 2);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}