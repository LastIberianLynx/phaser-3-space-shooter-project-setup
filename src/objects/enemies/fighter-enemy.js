
import { BotFighterInputComponent } from "../../components/input/bot-fighter-input-component.js";
import { VerticalMovementComponent } from "../../components/movement/vertical-movement-component.js";
import { WeaponComponent} from "../../components/weapons/weapon-component.js";
import { HealthComponent } from '../../components/health/health-component.js';
import { ColliderComponent } from '../../components/collider/collider-component.js';
import * as CONFIG from '../../config.js';
import { CUSTOM_EVENTS } from "../../components/events/event-bus-component.js";


export class FighterEnemy extends Phaser.GameObjects.Container {
    #isInitialized;
    #inputComponent;
    #weaponComponent;
    #verticalInputComponent;

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

        this.#shipSprite = scene.add.sprite(0, 0, 'fighter', 0).setFlipY(true);
        this.#shipEngineSprite = scene.add.sprite(0, -18, 'fighter_engine').setFlipY(true);
        this.#shipEngineSprite.play('fighter_engine');

        // this.#shipSprite.angle = 180;
        this.add([ this.#shipEngineSprite,  this.#shipSprite ]);

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        }, this);


    }

    get weaponGameObjectGroup() {
        return this.#weaponComponent.bulletGroup;
    }

    get weaponComponent() {
        return this.#weaponComponent;
    }

    get colliderComponent() {
        return this.#colliderComponent;
    }
    get healthComponent() {
        return this.#healthComponent;
    }

    get shipAssetKey() {
        return 'fighter';
    }
    get shipDestroyedAnimationKey() {
        return 'fighter_destroy';
    }

    init(eventBusComponent) {
        this.#eventBusComponent = eventBusComponent;
        this.#inputComponent = new BotFighterInputComponent();
        this.#verticalInputComponent = new VerticalMovementComponent(this, this.#inputComponent, CONFIG.ENEMY_FIGHTER_MOVEMENT_VERTICAL_VELOCITY);
        this.#weaponComponent = new WeaponComponent(this, this.#inputComponent, {
            speed: CONFIG.ENEMY_FIGHTER_BULLET_SPEED,
            interval: CONFIG.ENEMY_FIGHTER_BULLET_INTERVAL,
            lifespan: CONFIG.ENEMY_FIGHTER_BULLET_LIFESPAN,
            maxCount: CONFIG.ENEMY_FIGHTER_BULLET_MAX_COUNT,
            yOffset: 10,
            flipY: true,
            }
        );

        
        this.#healthComponent = new HealthComponent(CONFIG.ENEMY_FIGHTER_HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
        this.#isInitialized = true;

    };
  
    reset() {
            this.setActive(true);
            this.setVisible(true);
            this.#healthComponent.reset();
            this.#verticalInputComponent.reset();
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
        this.#verticalInputComponent.update();
        this.#weaponComponent.update(dt);
    
    }
}