import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture } from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MySphere } from "./MySphere.js";
import { MyPanorama } from './MyPanorama.js';
import { MyBuilding } from './MyBuilding.js';
import { MyForest } from './MyForest.js';

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor(myInterface) {
    super();
    this.interface = myInterface;
  }
  init(application) {
    super.init(application);

    this.initCameras();
    this.initLights();
    this.initMaterials();

    //Background color
    this.gl.clearColor(0, 0, 0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);

    this.setUpdatePeriod(50);

    //Initialize scene objects
    this.axis = new CGFaxis(this, 20, 1);
    this.plane = new MyPlane(this, 64);
    //this.plane = new MyPlane(this, 64, 0, 4, 0, 4);
    this.sphere = new MySphere(this, 64, 32);
    this.sphereVisible = true;
    this.numFloors = 3;
    this.building = new MyBuilding(this, 100, this.numFloors, 2, 'images/window.png', [0.35, 0.35, 0.35]);
    this.forest = new MyForest(this, 5, 4, 300, 300, 100); // 5x4 forest in 200x200 area

    this.displayAxis = false;
    this.displaySphere = false;
    this.displayPlain = true;
    this.displayPanorama = true;
    this.displayBuilding = true;
    this.displayForest = true;
    this.scaleFactor = 1.0;
    this.scaleFactorSpeed = 1.0;
  }

  initLights() {
    this.setGlobalAmbientLight(0.5, 0.5, 0.5, 1.0);
    this.lights[0].setPosition(200, 200, 200, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
  }

  initCameras() {
    this.camera = new CGFcamera(
      0.8,
      0.1,
      500,
      vec3.fromValues(0, 100, 150),
      vec3.fromValues(0, 30, 0)
    );
  }
  
  initMaterials() {
    // Load grass texture
    this.grassTexture = new CGFtexture(this, 'images/grass.jpg');
    this.planeMaterial = new CGFappearance(this);
    this.planeMaterial.setTexture(this.grassTexture);
    this.planeMaterial.setTextureWrap('REPEAT', 'REPEAT');

    // Load sphere texture
    this.sphereMaterial = new CGFappearance(this);
    this.sphereTexture = new CGFtexture(this, 'images/earth.jpg');
    this.sphereMaterial.setAmbient(0.1, 0.1, 0.1, 1);
    this.sphereMaterial.setDiffuse(0.9, 0.9, 0.9, 1);
    this.sphereMaterial.setSpecular(0.1, 0.1, 0.1, 1);
    this.sphereMaterial.setShininess(10.0);
    this.sphereMaterial.setTexture(this.sphereTexture);
    this.sphereMaterial.setTextureWrap('REPEAT', 'REPEAT');

    // Load panorama texture and create MyPanorama
    this.panoramaTexture = new CGFtexture(this, 'images/landscape.jpg');
    this.panorama = new MyPanorama(this, this.panoramaTexture);
  }

  checkKeys() {
    var text = "Keys pressed: ";
    var keysPressed = false;

    // Check for key codes e.g. in https://keycode.info/
    if (this.gui.isKeyPressed("KeyW")) {
      text += " W ";
      keysPressed = true;
    }

    if (this.gui.isKeyPressed("KeyS")) {
      text += " S ";
      keysPressed = true;
    }
    if (keysPressed)
      console.log(text);
  }

  update(t) {
    this.checkKeys();
  }

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setShininess(10.0);
  }

  display() {
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.setDefaultAppearance();

    this.lights[0].update();

    // Draw axis  
    if (this.displayAxis) {
      this.axis.display();
    }
    
    if(this.displayPanorama) {
      this.panorama.display();
    }
    if (this.displayPlain) {
      this.pushMatrix();
      this.planeMaterial.apply(); 
      this.scale(400, 1, 400);
      this.rotate(-Math.PI / 2, 1, 0, 0);
      this.plane.display();
      this.popMatrix();
    }
    if (this.displaySphere) {
      this.pushMatrix();
      this.sphereMaterial.apply();
      this.scale(200, 200, 200);
      //this.scale(400, 400, 400);
      this.sphere.display();
      this.popMatrix();
    }
    if (this.displayBuilding) {
      this.pushMatrix();
      this.translate(0, 1.5, 0);
      //this.translate(0, 1.5, -150);
      this.building.display();
      this.popMatrix();
    }
    if (this.displayForest) {
      this.pushMatrix();
      //this.translate(0, 60, 0);
      //this.rotate(-Math.PI / 2, 1, 0, 0);
      this.forest.display();
      this.popMatrix();
    }
  }
}