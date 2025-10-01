import * as CONFIG from '../../config.js';
import { Player } from '../../objects/player.js';

export class HorizontalMovementComponent {
 #gameObject;
 #inputComponent;
#velocity;


 constructor(gameObject, inputComponent, velocity) {
   this.#gameObject = gameObject;
   this.#inputComponent = inputComponent;
   this.#velocity = velocity;

   this.#gameObject.body.setDamping(true);
   this.#gameObject.body.setDrag(CONFIG.COMPONENT_MOVEMENT_HORIZONTAL_DRAG);
   this.#gameObject.body.setMaxVelocity(CONFIG.COMPONENT_MOVEMENT_HORIZONTAL_MAX_VELOCITY);
 }

 reset() {
   this.#gameObject.body.velocity.x = 0;
   this.#gameObject.body.setAngularAcceleration(0);

 }
 
    update() {

        // if (this.#inputComponent.leftIsDown) {
        //     this.#gameObject.body.velocity.x -= this.#velocity;
        // } else if (this.#inputComponent.rightIsDown) {
        //     this.#gameObject.body.velocity.x += this.#velocity;
        // }   else {      
        //     this.#gameObject.body.setAngularAcceleration(0);
        // }

        // const tiltAmount = 10; // degrees
        // const warpAmount = 0.2; // how much to squash/stretch
        // if (this.#inputComponent.leftIsDown) {
        //     this.#gameObject.angle = Phaser.Math.Linear(this.#gameObject.angle, -tiltAmount, 0.2);
        //     this.#gameObject.body.velocity.x -= this.#velocity;
        //     this.#gameObject.scaleX = Phaser.Math.Linear(this.#gameObject.scaleX, 1 - warpAmount, 0.2);


        // } else if (this.#inputComponent.rightIsDown) {
        //     this.#gameObject.angle = Phaser.Math.Linear(this.#gameObject.angle, tiltAmount, 0.2);
        //     this.#gameObject.body.velocity.x += this.#velocity;
        //         this.#gameObject.scaleX = Phaser.Math.Linear(this.#gameObject.scaleX, 1 + warpAmount, 0.2);
        // } else {
        //     this.#gameObject.angle = Phaser.Math.Linear(this.#gameObject.angle, 0, 0.2);
        //     this.#gameObject.body.setAngularAcceleration(0);

        //      this.#gameObject.scaleX = Phaser.Math.Linear(this.#gameObject.scaleX, 1, 0.2);
        // }

        const tiltAmount = 6; // degrees
        const facingAngle = this.#gameObject.angle;
        const isPlayer = this.#gameObject instanceof Player;

    if (this.#inputComponent.leftIsDown) {
        this.#gameObject.body.velocity.x -= this.#velocity;
        if(isPlayer) {
            this.#gameObject.angle = Phaser.Math.Linear(this.#gameObject.angle, -tiltAmount, 0.2);
            this.#gameObject.scaleX = Phaser.Math.Linear(this.#gameObject.scaleX, 0.8, 0.2);
            //for now i do this only with the player
        }


        } else if (this.#inputComponent.rightIsDown) {
        if(isPlayer) {
            this.#gameObject.angle = Phaser.Math.Linear(this.#gameObject.angle, tiltAmount, 0.2);
            this.#gameObject.scaleX = Phaser.Math.Linear(this.#gameObject.scaleX, .8, 0.2);
            
        }
            this.#gameObject.body.velocity.x += this.#velocity;

        } else {
        if(isPlayer) {
            this.#gameObject.angle = Phaser.Math.Linear(this.#gameObject.angle, 0, 0.2);
            this.#gameObject.scaleX = Phaser.Math.Linear(this.#gameObject.scaleX, 1, 0.2);
        }

            this.#gameObject.body.setAngularAcceleration(0);
        }
    }

}