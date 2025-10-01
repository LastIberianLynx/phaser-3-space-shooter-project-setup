
import { BotScoutInputComponent } from "../../components/input/bot-scout-input-component.js";
import { VerticalMovementComponent } from "../../components/movement/vertical-movement-component.js";
import { HorizontalMovementComponent } from '../../components/movement/horizontal-movement-component.js';      
import { HealthComponent } from '../../components/health/health-component.js';
import { ColliderComponent } from '../../components/collider/collider-component.js';
import * as CONFIG from '../../config.js';
import { CUSTOM_EVENTS } from "../../components/events/event-bus-component.js";


export class ScoutEnemy extends Phaser.GameObjects.Container {
    #isInitialized;
    #inputComponent;
    #horizontalMovementComponent;
    #verticalMovementComponent;

    #healthComponent;
    #colliderComponent;

    #shipSprite;
    #shipEngineSprite;

    #eventBusComponent;

    constructor(scene, x, y) {
        super(scene,x, y, []);
        this.#isInitialized = false;
        this.scene.add.existing(this); //add this, player, to the scene;
        this.scene.physics.add.existing(this); //add physics body to this container
        this.body.setSize(32, 32);
        this.body.setOffset(-16, -16);

        this.#shipSprite = scene.add.sprite(0, 0, 'scout', 0).setFlipY(true);
        this.#shipEngineSprite = scene.add.sprite(0, -18, 'scout_engine').setFlipY(true);
        this.#shipEngineSprite.play('scout_engine');

        // this.#shipSprite.angle = 180;
        this.add([ this.#shipEngineSprite,  this.#shipSprite ]);

  

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        }, this);
    }

    get colliderComponent() {
        return this.#colliderComponent;
    }

    get healthComponent() {
        return this.#healthComponent;
    }
    get shipAssetKey() {
        return 'scout';
    }
    get shipDestroyedAnimationKey() {
        return 'scout_destroy';
    }

        init(eventBusComponent) {
            this.#eventBusComponent = eventBusComponent;
            this.#inputComponent = new BotScoutInputComponent(this);
            this.#verticalMovementComponent = new VerticalMovementComponent(
                this, 
                this.#inputComponent, 
                CONFIG.ENEMY_SCOUT_MOVEMENT_VERTICAL_VELOCITY
            );
            
            this.#horizontalMovementComponent = new HorizontalMovementComponent(
                this, 
                this.#inputComponent, 
                CONFIG.ENEMY_SCOUT_MOVEMENT_HORIZONTAL_VELOCITY
            );
            
            this.#healthComponent = new HealthComponent(CONFIG.ENEMY_SCOUT_HEALTH);
            this.#colliderComponent = new ColliderComponent(this.#healthComponent);
            this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
            this.#isInitialized = true;
            
        }

    reset() {
            this.setActive(true);
            this.setVisible(true);
            this.#healthComponent.reset();
            this.#inputComponent.startX = this.x;
            this.#horizontalMovementComponent.reset();
            this.#verticalMovementComponent.reset();
    }

    update(ts, dt ) {
        if(!this.#isInitialized)
            return;

        if(!this.active) {  
            return;
        }

        if(this.healthComponent.isDead) {
            this.setActive(false);
            this.setVisible(false);
            this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);

        }

        this.#inputComponent.update();
        this.#horizontalMovementComponent.update();
        this.#verticalMovementComponent.update();
    
    }
}