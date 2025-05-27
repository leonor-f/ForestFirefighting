import { CGFinterface, dat } from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // Call CGFinterface init
        super.init(application);

        // init GUI. For more information on the methods, check:
        // https://github.com/dataarts/dat.gui/blob/master/API.md
        this.gui = new dat.GUI();

        // Checkbox element in GUI
        this.gui.add(this.scene, 'displayAxis').name('Display Axis');

        // Checkbox to control the Plain Visibility
        this.gui.add(this.scene, 'displayPlain').name('Plain');

        // Checkbox to control the Panorama Visibility
        this.gui.add(this.scene, 'displayPanorama').name('Panorama');

        // Checkbox to control the Building Visibility
        this.gui.add(this.scene, 'displayBuilding').name('Display Building');

        // Slider to control the Number of Floors
        this.gui.add(this.scene, 'numFloors', 1, 10).name('Floors').step(1).onChange((value) => {
            this.scene.building.lateralFloors = value;
            this.scene.building.centralFloors = value + 1;
        }
        );

        // Checkbox to control the Forest Visibility
        this.gui.add(this.scene, 'displayForest').name('Display Forest');

        // Checkbox to control the Helicopter Visibility
        this.gui.add(this.scene, 'displayHelicopter').name('Helicopter');

        this.gui.add(this.scene, 'speedFactor', 1, 3).name('Speed').step(0.1).onChange((value) => {
            this.scene.helicopter.speedFactor = value;
        }
        );

        //this.scene.setupControls(this.gui);
        this.initKeys();

        return true;
    }

    initKeys() {
        // Create reference from the scene to the GUI
        this.scene.gui = this;

        // Disable the processKeyboard function
        this.processKeyboard = function () { };

        // Create a named array to store which keys are being pressed
        this.activeKeys = {};
    }
    processKeyDown(event) {
        // Called when a key is pressed down
        // Mark it as active in the array
        this.activeKeys[event.code] = true;
    };

    processKeyUp(event) {
        // Called when a key is released, mark it as inactive in the array
        this.activeKeys[event.code] = false;
    };

    isKeyPressed(keyCode) {
        // Returns true if a key is marked as pressed, false otherwise
        return this.activeKeys[keyCode] || false;
    }
}