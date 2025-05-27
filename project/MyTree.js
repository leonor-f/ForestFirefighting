import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyCylinder } from './MyCylinder.js';
import { MyPyramid } from './MyPyramid.js';
import { MyCircle } from './MyCircle.js';

export class MyTree extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {number} trunkRadius - Radius of the trunk base
     * @param {number} treeHeight - Total height of the tree
     * @param {number} tiltAngle - Tree tilt angle in degrees
     * @param {string} tiltAxis - Axis of rotation ('x' or 'z')
     * @param {array} foliageColor - RGB color for foliage [r, g, b]
     */
    constructor(scene, trunkRadius, treeHeight, tiltAngle, tiltAxis, foliageColor) {
        super(scene);
        
        // Store parameters
        this.trunkRadius = trunkRadius;
        this.treeHeight = treeHeight;
        this.tiltAngle = tiltAngle;
        this.tiltAxis = tiltAxis;
        this.foliageColor = foliageColor;
        
        // Calculate derived parameters
        this.trunkHeight = treeHeight * 0.15; // Trunk is 15% of total height
        this.foliageHeight = treeHeight * 0.85; // Foliage is 85% of total height
        this.pyramidCount = Math.max(3, Math.floor(treeHeight / 5)); // Number of pyramids based on height
        
        // Initialize components
        this.trunk = new MyCylinder(scene, 8, 1, this.trunkRadius * 0.8, this.trunkRadius * 0.5, this.trunkHeight);
        this.pyramids = [];
        
        // Create multiple pyramids for foliage
        for (let i = 0; i < this.pyramidCount; i++) {
            this.pyramids.push(new MyPyramid(scene, 8, 4));
        }
        
        // Initialize shadow circle
        this.shadowCircle = new MyCircle(scene, 32); // 32 slices for smoothness

        // Initialize materials
        this.initMaterials();
    }
    
    initMaterials() {
        // Trunk material (brown)
        this.trunkMaterial = new CGFappearance(this.scene);
        this.trunkMaterial.setAmbient(0.3, 0.2, 0.1, 1.0);
        this.trunkMaterial.setDiffuse(0.6, 0.4, 0.2, 1.0);
        this.trunkMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.trunkMaterial.setShininess(10.0);
        
        // Load trunk texture
        this.trunkTexture = new CGFtexture(this.scene, 'images/wood.jpg');
        this.trunkMaterial.setTexture(this.trunkTexture);
        this.trunkMaterial.setTextureWrap('REPEAT', 'REPEAT');
        
        // Foliage material (green with texture)
        this.foliageMaterial = new CGFappearance(this.scene);
        // Base color green
        const r = this.foliageColor[0];
        const g = this.foliageColor[1];
        const b = this.foliageColor[2];
        this.foliageMaterial.setAmbient(r * 0.3, g * 0.3, b * 0.3, 1.0);
        this.foliageMaterial.setDiffuse(r, g, b, 1.0);
        this.foliageMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.foliageMaterial.setShininess(10.0);
        // Load leaves texture
        this.foliageTexture = new CGFtexture(this.scene, 'images/leaf5.jpg');
        this.foliageMaterial.setTexture(this.foliageTexture);
        this.foliageMaterial.setTextureWrap('REPEAT', 'REPEAT');
        
        // Shadow material (gradient texture)
        this.shadowMaterial = new CGFappearance(this.scene);
        // Load shadow texture
        this.shadowTexture = new CGFtexture(this.scene, 'images/shadow5.png');
        this.shadowMaterial.setTexture(this.shadowTexture);
        this.shadowMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }
    
    display() {
        this.scene.pushMatrix();

        // Ensure the tree is upright
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);

        // Apply tree tilt
        if (this.tiltAxis === 'x') {
            this.scene.rotate(this.tiltAngle * Math.PI / 240, 1, 0, 0);
        } else {
            this.scene.rotate(this.tiltAngle * Math.PI / 240, 0, 0, 1);
        }

        // Display trunk
        this.scene.pushMatrix();
        this.trunkMaterial.apply();
        this.scene.scale(1, 1, this.trunkHeight);
        this.trunk.display();
        this.scene.popMatrix();

        // Display foliage (pyramids)
        this.scene.pushMatrix();
        this.foliageMaterial.apply();
        this.scene.translate(0, 0, this.trunkHeight);

        const stepHeight = this.foliageHeight / this.pyramids.length;
        let zBase = 0;
        for (let i = 0; i < this.pyramids.length; i++) {
            const t = 1 - i / this.pyramids.length;
            const height = stepHeight * 2;
            const radius = this.trunkRadius * (1 + t * 2.5);

            this.scene.pushMatrix();
            this.scene.translate(0, 0, zBase + height * 0.20);
            this.scene.scale(radius, radius, height);
            this.pyramids[i].display();
            this.scene.popMatrix();

            zBase += height * 0.55;
        }

        this.scene.popMatrix();
        this.scene.popMatrix();
    }
    
    displayShadow() {
        this.scene.pushMatrix();

        // Enable blending for transparency
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA, this.scene.gl.ONE, this.scene.gl.ONE);

        /*this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.ZERO, this.scene.gl.SRC_COLOR);*/

        this.shadowMaterial.apply();

        // Position shadow on the ground
        this.scene.translate(0, 0.02, 0.01); // Slightly above ground to avoid z-fighting

        // Scale shadow to match tree size
        this.scene.scale(this.trunkRadius * 2.5, 1, this.trunkRadius * 2.5);

        // Render shadow circle
        this.shadowCircle.display();

        // Disable blending after rendering
        this.scene.gl.disable(this.scene.gl.BLEND);

        this.scene.popMatrix();
    }
}