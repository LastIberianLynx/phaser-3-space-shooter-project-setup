
import { BotFighterInputComponent } from "../../components/input/bot-fighter-input-component.js";
import { VerticalMovementComponent } from "../../components/movement/vertical-movement-component.js";
import { WeaponComponent} from "../../components/weapons/weapon-component.js";
import { HealthComponent } from '../../components/health/health-component.js';
import { ColliderComponent } from '../../components/collider/collider-component.js';
import * as CONFIG from '../../config.js';
import { CUSTOM_EVENTS } from "../../components/events/event-bus-component.js";
import { GunComponent } from "../../components/weapons/gun-component.js";


export class DestroyerEnemy extends Phaser.GameObjects.Container {
    #isInitialized;
    #inputComponent;
    #verticalInputComponent;
    
    #healthComponent;
    #colliderComponent;
    #shipSprite;
    #shipEngineSprite;
    
    #eventBusComponent;
    
    #weaponComponent;
    #gunComponent;
    #player;

    constructor(scene, x, y) {
        super(scene,x, y-400, []);

        this.#isInitialized = false;
        this.scene.add.existing(this); //add this, player, to the scene;
        this.scene.physics.add.existing(this); //add physics body to this container
        this.body.setSize(50, 200);
        this.body.setOffset(-25, -100);
        this.setDepth(3);


        this.#shipSprite = scene.add.sprite(0, 0, 'destroyer', 0).setFlipY(false);
        this.#shipEngineSprite = scene.add.sprite(0, -18, 'fighter_engine').setFlipY(false);
        this.#shipEngineSprite.play('fighter_engine');
        this.#player = scene.player;
        
        // this.#shipSprite.angle = 180;
        this.add([ this.#shipEngineSprite,  this.#shipSprite ]);
        this.#gunComponent = new GunComponent(this, 'cannon', {x: 0, y: 0}, 0.4);

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
        return 'destroyer';
    }
    get shipDestroyedAnimationKey() {
        return 'destroyer_destroy';
    }

    init(eventBusComponent) {
        this.#eventBusComponent = eventBusComponent;
        this.#inputComponent = new BotFighterInputComponent();
        this.#verticalInputComponent = new VerticalMovementComponent(this, this.#inputComponent, CONFIG.ENEMY_DESTROYER_MOVEMENT_VERTICAL_VELOCITY);
        this.#weaponComponent = new WeaponComponent(this, { get shootIsDown() { return true; } }, {
            speed: CONFIG.ENEMY_DESTROYER_BULLET_SPEED,
            interval: CONFIG.ENEMY_DESTROYER_BULLET_INTERVAL,
            lifespan: CONFIG.ENEMY_DESTROYER_BULLET_LIFESPAN,
            maxCount: CONFIG.ENEMY_DESTROYER_BULLET_MAX_COUNT,
            yOffset: 10,
            flipY: true,
            },
            this.#eventBusComponent
        );


        this.#healthComponent = new HealthComponent(CONFIG.ENEMY_DESTROYER_HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
        this.#isInitialized = true;

    };
  
    reset() {
            this.setActive(true);
            this.setVisible(true);
            this.#healthComponent.reset();
            this.#verticalInputComponent.reset();
            this.y =- 400;
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

        let direction = { x: 0, y: 1 }; // default down
        if (this.#player && this.#player.x !== undefined && this.#player.y !== undefined) {
            const dx = this.x - this.#player.x;
            const dy = this.y - this.#player.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length > 0) {
                direction = { x: dx / length, y: dy / length };
            }
        }

        this.#weaponComponent.update(dt, direction);
        this.#gunComponent.rotateTowards(this.#player);
    
    }
}