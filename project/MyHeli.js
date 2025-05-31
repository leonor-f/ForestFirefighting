import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyHeliBody } from './MyHeliBody.js'; 
import { MyHeliWindows } from './MyHeliWindows.js';
import { MyHeliHelix } from './MyHeliHelix.js';
import { MyWaterBucket } from './MyWaterBucket.js';
import { MyHeliLittleHelix } from './MyHeliLittleHelix.js';
import { MyCylinder } from './MyCylinder.js';

export class MyHeli extends CGFobject {
    constructor(scene) {
        super(scene);

        // Materials
        this.bodyMaterial = new CGFappearance(scene);
        this.bodyMaterial.setAmbient(0.2, 0.2, 0.2, 1.0);
        this.bodyMaterial.setDiffuse(0.8, 0.0, 0.0, 1.0);  // Red
        this.bodyMaterial.setSpecular(0.5, 0.5, 0.5, 1.0);
        this.bodyMaterial.setShininess(10.0);

        this.helixMaterial = new CGFappearance(scene);
        this.helixMaterial.setAmbient(0.2, 0.2, 0.2, 1.0);
        this.helixMaterial.setDiffuse(0.05, 0.05, 0.05, 1.0);  // Dark gray
        this.helixMaterial.setSpecular(0.6, 0.6, 0.6, 1.0);
        this.helixMaterial.setShininess(50.0);

        this.windowsMaterial = new CGFappearance(scene);
        this.windowsMaterial.setAmbient(0.2, 0.2, 0.2, 1.0);
        this.windowsMaterial.setDiffuse(0.3, 0.5, 0.8, 1.0);  // Light blue
        this.windowsMaterial.setSpecular(0.9, 0.9, 0.9, 1.0);
        this.windowsMaterial.setShininess(100.0);

        this.bucketMaterial = new CGFappearance(scene);
        this.bucketMaterial.setAmbient(0.2, 0.2, 0.2, 1.0);
        this.bucketMaterial.setDiffuse(0.8, 0.0, 0.0, 1.0);  // Red
        this.bucketMaterial.setSpecular(0.3, 0.3, 0.3, 1.0);
        this.bucketMaterial.setShininess(20.0);
        this.bucketMaterial.setTexture(new CGFtexture(scene, 'images/bucket.png'));

        this.waterMaterial = new CGFappearance(scene);
        this.waterMaterial.setAmbient(0.1, 0.3, 0.5, 1.0);
        this.waterMaterial.setDiffuse(0.2, 0.6, 1.0, 1.0);
        this.waterMaterial.setSpecular(0.8, 0.8, 0.8, 1.0);
        this.waterMaterial.setShininess(100.0);
        this.waterMaterial.setTexture(new CGFtexture(scene, 'images/waterTex.jpg'));

        // Objects
        this.body = new MyHeliBody(scene);
        this.helihelix = new MyHeliHelix(scene);
        this.littlehelihelix = new MyHeliLittleHelix(scene);
        this.waterbucket = new MyWaterBucket(scene, 1);
        this.windows = new MyHeliWindows(scene);
        this.bucketContent = new MyCylinder(scene, 16, 1, 0.8, 0.8, 1.0); 

        // Helicopter state variables
        this.position = vec3.fromValues(0, 0, 0);   
        this.orientation = 0;                        
        this.velocity = vec3.fromValues(0, 0, 0);    
        this.speed = 0;                          
        
        // Animation parameters
        this.maxSpeed = 5.0;                         
        this.acceleration = 0.1;                   
        this.turnRate = Math.PI / 30;           
        this.tiltAmount = Math.PI / 20;              
        this.currentTilt = 0;                        
        
        // Altitude settings
        this.groundLevel = 0;                      
        this.cruisingAltitude = 20;                 
        this.verticalSpeed = 0.5;                    
        
        // Helicopter status
        this.isFlying = false;                       
        this.isLanding = false;                      
        this.isTakingOff = false;                  
        this.isMovingToHeliport = false;             
        this.isFetchingWater = false;    
        this.isExtinguishingFire = false;    
        
        // Add these new properties
        this.isAccelerating = false;
        this.deceleration = 0.05;
        
        // Bucket status
        this.bucketAttached = false;               
        this.bucketFilled = false;                  
        
        // Helix animation
        this.helixRotationAngle = 0;             
        this.helixRotationSpeed = 0;                
        this.maxHelixSpeed = 5;    
        
        // Bucket animation 
        this.bucketVerticalOffset = 0;
        this.bucketAnimating = false;
        this.bucketAnimationDirection = 0; 
        this.bucketAnimationSpeed = 0.2;
        this.maxBucketOffset = -5;
        
        // Locations
        this.heliportPosition = vec3.fromValues(0, this.groundLevel, 0);                                       

        // Water fetching state
        this.isDescendingForWater = false;
        this.isAscendingWithWater = false;
        this.waterPickupAltitude = -40;
        this.lakePosition = vec3.fromValues(-165, 0, -140); 
        this.lakeRadius = 80; 

        // Extinguishing fire state
        this.fireRadius = 20;
    }

    update(t, delta_t, speedFactor = 1.0) {
        this.updateHelix(delta_t);
        this.updateBucketPosition(t); 
        const effectiveSpeed = this.speed * speedFactor;
        
        // Apply deceleration when flying and no input is being given
        if (this.isFlying && !this.isAccelerating) {
            this.applyDeceleration(delta_t);
        }
        
        if (this.isTakingOff) {
            this.handleTakeOff(delta_t);
        } else if (this.isLanding) {
            this.handleLanding(delta_t);
        } else if (this.isMovingToHeliport) {
            this.moveToHeliport(delta_t, speedFactor);
        } else if (this.isDescendingForWater) {
            this.handleWaterPickupDescent(delta_t);
        } else if (this.isAscendingWithWater) {
            this.handleWaterAscent(delta_t);
        } else if (this.isFlying) {
            const movement = vec3.create();
            vec3.scale(movement, this.velocity, delta_t * 0.001 * effectiveSpeed);
            vec3.add(this.position, this.position, movement);
            this.updateTilt(delta_t);
        }
        this.updateTilt(delta_t); 
        this.isAccelerating = false;
    }

    updateHelix(delta_t) {
        this.helixRotationAngle += this.helixRotationSpeed * delta_t * 0.01;
        if (this.helixRotationAngle > 2 * Math.PI) {
            this.helixRotationAngle -= 2 * Math.PI;
        }
        
        if (this.isFlying || this.isTakingOff || this.isFetchingWater || 
            this.isMovingToHeliport || this.isDescendingForWater || this.isAscendingWithWater) {
            if (this.helixRotationSpeed < this.maxHelixSpeed) {
                this.helixRotationSpeed = Math.min(this.helixRotationSpeed + 0.1, this.maxHelixSpeed);
            }
        } 
        else if (this.isLanding || (!this.isFlying && !this.isTakingOff)) {
            if (this.helixRotationSpeed > 0) {
                this.helixRotationSpeed = Math.max(this.helixRotationSpeed - 0.05, 0);
            }
        }
    }

    updateBucketPosition(t) {
        if (!this.bucketAnimating) return;
        
        if (this.bucketAnimationDirection === 1) { 
            this.bucketVerticalOffset += this.bucketAnimationSpeed;
            if (this.bucketVerticalOffset >= 0) {
                this.bucketVerticalOffset = 0;
                this.bucketAnimating = false;
            }
        } else {
            this.bucketVerticalOffset -= this.bucketAnimationSpeed;
            if (this.bucketVerticalOffset <= this.maxBucketOffset) {
                this.bucketVerticalOffset = this.maxBucketOffset;
                this.bucketAnimating = false;
            }
        }
    }

    handleTakeOff(delta_t) {
        if (this.helixRotationSpeed < this.maxHelixSpeed) {
            this.helixRotationSpeed = Math.min(this.helixRotationSpeed + 0.1, this.maxHelixSpeed);
            return; 
        }
        
        if (this.position[1] < this.cruisingAltitude) {
            this.position[1] += this.verticalSpeed * delta_t * 0.01;
            if (this.position[1] > this.cruisingAltitude - 0.5 && !this.bucketAttached) {
                this.attachBucket(); 
            }
        } else {
            this.position[1] = this.cruisingAltitude;
            this.isTakingOff = false;
            this.isFlying = true;
        }
    }

    handleLanding(delta_t) {
        if (this.position[1] > this.groundLevel) {
            this.position[1] -= this.verticalSpeed * delta_t * 0.01;
            if (this.position[1] < this.cruisingAltitude && this.bucketAttached) {
                this.detachBucket(); 
            }
        } else {
            this.position[1] = this.groundLevel;
            this.isLanding = false;
            this.isFlying = false;
            this.speed = 0;
            vec3.set(this.velocity, 0, 0, 0);
            this.currentTilt = 0;
        }
    }

    moveToHeliport(delta_t, speedFactor) {
        const direction = vec3.create();
        vec3.subtract(direction, this.heliportPosition, this.position);
        direction[1] = 0; 
        const distanceToHeliport = vec3.length(direction);
        if (distanceToHeliport < 5) {
            this.isMovingToHeliport = false;
            this.isLanding = true;
            return;
        }

        vec3.normalize(direction, direction);
        vec3.scale(this.velocity, direction, this.maxSpeed * 0.75);
        const targetAngle = Math.atan2(direction[0], direction[2]);
        
        const angleDiff = this.normalizeAngle(targetAngle - this.orientation);
        if (Math.abs(angleDiff) > 0.05) {
            this.orientation += Math.sign(angleDiff) * this.turnRate * delta_t * 0.01 * speedFactor;
            this.orientation = this.normalizeAngle(this.orientation);
        } else {
            this.orientation = targetAngle;
        }
        const movement = vec3.create();
        vec3.scale(movement, this.velocity, delta_t * 0.001 * speedFactor);
        vec3.add(this.position, this.position, movement);
    }

    updateTilt(delta_t) {
        let targetTilt = 0;
        if (this.speed > 0.1) {
            targetTilt = this.tiltAmount; 
        } 
        else if (this.speed < -0.1) {
            targetTilt = -this.tiltAmount; 
        }
        if (Math.abs(this.currentTilt - targetTilt) > 0.01) {
            this.currentTilt += (targetTilt - this.currentTilt) * 0.1;
        } else {
            this.currentTilt = targetTilt;
        }
    }

    turn(v, speedFactor = 1.0) {
        if (!this.isFlying) return;
        const effectiveTurnRate = this.turnRate * speedFactor;
        this.orientation += v * effectiveTurnRate;
        this.orientation = this.normalizeAngle(this.orientation);
        if (this.speed !== 0) {
          const speed = vec3.length(this.velocity);
          vec3.set(this.velocity, 
                   Math.sin(this.orientation) * speed, 
                   0, 
                   Math.cos(this.orientation) * speed);
        }
    }
    
    accelerate(v, speedFactor = 1.0) {
        if (!this.isFlying) return;
        this.isAccelerating = true;
        const effectiveAccel = this.acceleration * speedFactor;
        this.speed += v * effectiveAccel;
        this.speed = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.speed));
        if (this.speed > 0) {
            vec3.set(this.velocity, 
                    Math.sin(this.orientation) * this.speed, 
                    0, 
                    Math.cos(this.orientation) * this.speed);
        }
    }

    applyDeceleration(delta_t) {
        if (Math.abs(this.speed) > 0.01) {
            const decelerationAmount = this.deceleration * delta_t * 0.01;
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - decelerationAmount);
            } else {
                this.speed = Math.min(0, this.speed + decelerationAmount);
            }
            
            if (this.speed > 0) {
                vec3.set(this.velocity, 
                        Math.sin(this.orientation) * this.speed, 
                        0, 
                        Math.cos(this.orientation) * this.speed);
            } else {
                vec3.set(this.velocity, 0, 0, 0);
            }
        } else {
            this.speed = 0;
            vec3.set(this.velocity, 0, 0, 0);
        }
    }

    reset() {
        vec3.copy(this.position, this.heliportPosition);
        this.orientation = 0;
        this.speed = 0;
        vec3.set(this.velocity, 0, 0, 0);
        this.isFlying = false;
        this.isLanding = false;
        this.isTakingOff = false;
        this.isMovingToHeliport = false;
        this.isFetchingWater = false;
        this.isDescendingForWater = false;
        this.isAscendingWithWater = false;
        this.isExtinguishingFire = false; 
        this.currentTilt = 0;
        this.helixRotationSpeed = 0;
        this.bucketAttached = false;
        this.bucketFilled = false;
    }

    takeOff() {
        if (!this.isFlying && !this.isTakingOff) {
            this.isTakingOff = true;
        } else if (this.isFetchingWater) {
            this.isFetchingWater = false;
            this.isTakingOff = true;
        }
    }

    land() {
        if (!this.isFlying) return;
        if(this.isOverLake() && this.speed < 0.1) {
            this.startWaterPickup();
        } else {
            this.isMovingToHeliport = true;
        }
        this.isFlying = false;
    }

    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

    attachBucket() {
        this.bucketAttached = true;
        this.bucketVerticalOffset = this.maxBucketOffset;
        this.bucketAnimating = true;
        this.bucketAnimationDirection = 1; // Descending
    }

    detachBucket() {
        this.bucketAnimationDirection = -1; // Ascending
        this.bucketAnimating = true;
        this.bucketAttached = false;
    }

    // Check if helicopter is over the lake
    isOverLake() {
        const distanceToLake = Math.sqrt(
            Math.pow(this.position[0] - this.lakePosition[0], 2) + 
            Math.pow(this.position[2] - this.lakePosition[2], 2)
        );
        return distanceToLake <= this.lakeRadius;
    }

    // Start water pickup sequence
    startWaterPickup() {
        if (!this.isOverLake() || this.bucketFilled) {
            return false; 
        }
        
        this.isDescendingForWater = true;
        this.isFlying = false;
        this.speed = 0;
        vec3.set(this.velocity, 0, 0, 0);
        return true;
    }

    // Start ascending with water
    startAscendingWithWater() {
        if (!this.isDescendingForWater || this.position[1] > this.waterPickupAltitude + 1) {
            return false;
        }
        
        this.isDescendingForWater = false;
        this.isAscendingWithWater = true;
        this.bucketFilled = true;
        return true;
    }

    // Handle water pickup descent
    handleWaterPickupDescent(delta_t) {
        if (this.position[1] > this.waterPickupAltitude) {
            this.position[1] -= this.verticalSpeed * delta_t * 0.01;
        } else {
            this.position[1] = this.waterPickupAltitude;
            if (!this.bucketFilled) {
                this.bucketFilled = true;
                this.startAscendingWithWater();
            }
        }
    }

    // Handle ascent with water
    handleWaterAscent(delta_t) {
        if (this.position[1] < this.cruisingAltitude) {
            this.position[1] += this.verticalSpeed * delta_t * 0.01;
        } else {
            this.position[1] = this.cruisingAltitude;
            this.isAscendingWithWater = false;
            this.isFlying = true;
        }
    }

    extinguishFire() { 
        if (!this.isFlying || !this.bucketFilled) {
            return false;
        }

        let heliWorldX = this.position[0];
        let heliWorldZ = this.position[2];
        let forestX = heliWorldX + 165;
        let forestZ = heliWorldZ - 140;
        let finalX = -forestX/2;
        let finalZ = -forestZ;
                
        if (!this.scene.forest || !this.scene.forest.fires) {
            return false;
        }
        
        // Check if helicopter is over any active fire
        let foundActiveFire = false;
        for (const fireData of this.scene.forest.fires) {
            if (!fireData.fire.isExtinguished) {
                const distanceToFire = Math.sqrt(
                    Math.pow(finalX - fireData.x, 2) + 
                    Math.pow(finalZ - fireData.z, 2)
                );                
                if (distanceToFire <= this.fireRadius) { 
                    foundActiveFire = true;
                    break;
                }
            }
        }
        
        if (!foundActiveFire) {
            return false;
        }
        
        this.isExtinguishingFire = true;
        this.bucketFilled = false;
        
        // Extinguish fires in range
        if (this.scene.forest && typeof this.scene.forest.extinguishFiresInRange === 'function') {
            const extinguished = this.scene.forest.extinguishFiresInRange(finalX, finalZ, this.fireRadius);
            return extinguished > 0;
        }
        
        return false;
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.position[0], this.position[1], this.position[2]);
        this.scene.rotate(this.orientation, 0, 1, 0);
        if (this.isFlying) {
            this.scene.rotate(this.currentTilt, 1, 0, 0);
        }
        
        // Display helicopter body
        this.bodyMaterial.apply();
        this.scene.pushMatrix();
        this.body.display();
        this.scene.popMatrix();

        // Display windows
        this.windowsMaterial.apply();
        this.scene.pushMatrix();
        this.windows.display();
        this.scene.popMatrix();
        
        // Display main helix with rotation
        this.helixMaterial.apply();
        this.scene.pushMatrix();
        this.scene.rotate(this.helixRotationAngle, 0, 1, 0);
        this.helihelix.display();
        this.scene.popMatrix();

        // Display tail helix with rotation
        this.helixMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 3.13, -16.54);
        this.scene.rotate(this.helixRotationAngle * 1.5, 1, 0, 0);
        this.scene.translate(0, -3.13, 16.54);

        this.littlehelihelix.display();
        this.scene.popMatrix();

    // Display water bucket
    if (this.bucketAttached || this.bucketAnimating) {
        this.bucketMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, -this.bucketVerticalOffset, 0); 
        this.waterbucket.display();
        
        // Display bucket content (water or empty)
        if( this.bucketFilled) {
            this.scene.pushMatrix();
            this.scene.translate(0, -14.5, 0); 
            this.scene.rotate(Math.PI / 2, 1, 0, 0);
            this.scene.scale(1.5, 1.5, 2); 
            this.waterMaterial.apply();
            this.bucketContent.material = this.waterMaterial;
            this.bucketContent.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }
        
    this.scene.popMatrix();
    }
}