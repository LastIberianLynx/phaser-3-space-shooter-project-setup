import { PathMovementComponent } from "../../components/movement/free-movement-component.js";
import { HealthComponent } from '../../components/health/health-component.js';
import { ColliderComponent } from '../../components/collider/collider-component.js';
import { WeaponComponent } from "../../components/weapons/weapon-component.js";
import { GunComponent } from "../../components/weapons/gun-component.js";
import * as CONFIG from '../../config.js';
import { CUSTOM_EVENTS } from "../../components/events/event-bus-component.js";


export class FreePlaneEnemy extends Phaser.GameObjects.Container {
    #isInitialized;
    #freeMovementComponent;
    #healthComponent;
    #colliderComponent;
    #weaponComponent;
    #shipSprite;
    #shipEngineSprite;
    #eventBusComponent;
    #player; // Reference to player

    #gunComponent;

    constructor(scene, x, y, checkpoints, speed = 60, player, eventBusComponent) {
        super(scene, x, y, []);

        this.#player = player;
        this.#isInitialized = false;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(42, 42);
        this.body.setOffset(-16, -16);
        this.setDepth(3);


        this.#shipSprite = scene.add.sprite(0, 0, 'bomber', 0).setFlipY(true);
        this.#shipSprite.setScale(0.6); // Scales to 50% size
        
        
        
        this.#shipEngineSprite = scene.add.sprite(0, -18, 'fighter_engine').setFlipY(true);
        this.#shipEngineSprite.play('fighter_engine');
        this.add([this.#shipEngineSprite, this.#shipSprite]);

        this.#gunComponent = new GunComponent(this, 'cannon', {x: 0, y: 0});

        this.#healthComponent = new HealthComponent(CONFIG.ENEMY_FIGHTER_HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);

        // Initialize path movement
        this.#freeMovementComponent = new PathMovementComponent(this, checkpoints, speed);

        // Add weapon component (auto-fire)
        this.#weaponComponent = new WeaponComponent(this, { get shootIsDown() { return true; } }, {
            speed: CONFIG.ENEMY_BOMBER_BULLET_SPEED,
            interval: CONFIG.ENEMY_BOMBER_BULLET_INTERVAL,
            lifespan: CONFIG.ENEMY_BOMBER_BULLET_LIFESPAN,
            maxCount: CONFIG.ENEMY_BOMBER_BULLET_MAX_COUNT,
            yOffset: 10,
            flipY: true,
        },
        this.#eventBusComponent
        );

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        }, this);

        this.#isInitialized = true;

    }

    get colliderComponent() {
        return this.#colliderComponent;
    }
    get healthComponent() {
        return this.#healthComponent;
    }
    get weaponComponent() {
        return this.#weaponComponent;
    }
    get weaponGameObjectGroup() {
        return this.#weaponComponent.bulletGroup;
    }
    get shipAssetKey() {
        return 'fighter';
    }
    get shipDestroyedAnimationKey() {
    return 'universal_destroy'; //
    }

    init(eventBusComponent) {
    this.#eventBusComponent = eventBusComponent;
    this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
    }


    update(ts, dt) {
        if (!this.#isInitialized || !this.active) return;
        if (this.healthComponent.isDead) {
            this.setActive(false);
            this.setVisible(false);
            this.body.enable = false;

            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this); // <— unsubscribe
            this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);

            this.destroy(); // safe now
            return;
        }
        this.#freeMovementComponent.update();

        // --- Calculate direction to player ---
        let direction = { x: 0, y: 1 }; // default down
        if (this.#player && this.#player.x !== undefined && this.#player.y !== undefined) {
            const dx = this.x - this.#player.x;
            const dy = this.y - this.#player.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length > 0) {
                direction = { x: dx / length, y: dy / length };
            }
        }

        // Pass the direction to the weapon component
        
        this.#gunComponent.rotateTowards(this.#player);
        this.#weaponComponent.update(dt, direction);
        // this.#weaponComponent.update(dt, fireDirection);

    }
}