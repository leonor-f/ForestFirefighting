import { CGFobject, CGFappearance, CGFtexture, CGFshader } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';
import { MyWindow } from './MyWindow.js';
import { MyCircle } from './MyCircle.js';
import { MySphere } from './MySphere.js';

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

        // Initialize shaders
        this.helipadShader = new CGFshader(scene.gl, 'shaders/helipad.vert', 'shaders/helipad.frag');
        this.lightShader = new CGFshader(scene.gl, 'shaders/pulsatingLight.vert', 'shaders/pulsatingLight.frag');
        
        // Load textures for shader
        this.helipadTexture = new CGFtexture(scene, 'images/helipad.png');
        this.helipadUpTexture = new CGFtexture(scene, 'images/helipadUP.png'); 
        this.helipadDownTexture = new CGFtexture(scene, 'images/helipadDOWN.png');
        
        // Remove the old material-based approach
        this.helipadState = 'normal';
        this.lightColor = [1.0, 0.8, 0.0]; // Orange light

        this.lightOffMaterial = new CGFappearance(scene);
        this.lightOffMaterial.setAmbient(0.1, 0.1, 0.1, 1.0);
        this.lightOffMaterial.setDiffuse(0.2, 0.2, 0.2, 1.0);
        this.lightOffMaterial.setSpecular(0.0, 0.0, 0.0, 1.0);
        this.lightOffMaterial.setEmission(0.0, 0.0, 0.0, 1.0); 

        this.lightOnMaterial = new CGFappearance(scene);
        this.lightOnMaterial.setAmbient(1.0, 0.8, 0.0, 1.0);
        this.lightOnMaterial.setDiffuse(1.0, 0.6, 0.0, 1.0);
        this.lightOnMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.lightOnMaterial.setShininess(100.0);

        // Objects
        this.window = new MyWindow(scene, windowTexture);
        this.plane = new MyPlane(scene, 1);
        this.circle = new MyCircle(scene, 40);
        this.cornerLight = new MySphere(scene, 8, 4);
    }

    setHelipadState(state) {
        this.helipadState = state;
    }

    updateHelipadDisplay(deltaTime) {
        this.timeFactor = (this.timeFactor || 0) + deltaTime;
        
        let state = 0; 
        if (this.helipadState === 'takeoff') {
            state = 1;
        } else if (this.helipadState === 'landing') {
            state = 2;
        }
        
        this.helipadShader.setUniformsValues({
            uTimeFactor: this.timeFactor * 0.001,
            uState: state,
            uBlinkInterval: 2
        });
        
        // Update light shader
        let lightState = (state === 0) ? 0 : 1;
        this.lightShader.setUniformsValues({
            uTimeFactor: this.timeFactor,
            uState: lightState,
            uLightColor: this.lightColor
        });
    }

    getCornerLightMaterial(time) {
        if (this.helipadState === 'normal') {
            return this.lightOffMaterial;
        }
        
        const pulseFactor = (Math.sin(time * 0.005) + 1) * 0.5; 
        const emissionIntensity = pulseFactor * 3.0;
        
        this.lightOnMaterial.setEmission(
            emissionIntensity,           
            emissionIntensity * 0.8,     
            emissionIntensity * 0.2,     
            1.0
        );
        
        this.lightOnMaterial.setAmbient(
            1.0 + emissionIntensity * 0.5,
            0.8 + emissionIntensity * 0.4,
            0.2,
            1.0
        );
        
        return this.lightOnMaterial;
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

        // Helipad with shader
        if (floors === this.centralFloors) {
            this.scene.pushMatrix();
            this.scene.translate(0, totalHeight + 0.1, -depth/2);
            this.scene.scale(width * 0.2, 1, width * 0.2);

            // Use helipad shader
            this.scene.setActiveShader(this.helipadShader);
            
            // Bind textures to different units
            this.helipadTexture.bind(0);
            this.helipadUpTexture.bind(1);
            this.helipadDownTexture.bind(2);
            
            // Set shader uniforms
            this.helipadShader.setUniformsValues({
                uSampler: 0,
                uSampler2: 1,
                uSampler3: 2
            });

            this.circle.display();
            
            // Reset to default shader
            this.scene.setActiveShader(this.scene.defaultShader);
            this.scene.popMatrix();
            
            // Corner lights with shader
            const lightSize = width * 0.02;
            const lightOffset = width * 0.18;
            const lightPositions = [
                [-lightOffset, lightOffset],   
                [lightOffset, lightOffset],    
                [-lightOffset, -lightOffset],  
                [lightOffset, -lightOffset]    
            ];
            
            for (let pos of lightPositions) {
                this.scene.pushMatrix();
                this.scene.translate(pos[0], totalHeight + 0.2, -depth/2 + pos[1]);
                this.scene.scale(lightSize, lightSize, lightSize);
                
                // Use light shader
                this.scene.setActiveShader(this.lightShader);
                this.cornerLight.display();
                this.scene.setActiveShader(this.scene.defaultShader);
                
                this.scene.popMatrix();
            }
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