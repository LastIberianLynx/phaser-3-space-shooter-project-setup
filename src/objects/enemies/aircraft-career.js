
import { BotFighterInputComponent } from "../../components/input/bot-fighter-input-component.js";
import { VerticalMovementComponent } from "../../components/movement/vertical-movement-component.js";
import { WeaponComponent} from "../../components/weapons/weapon-component.js";
import { HealthComponent } from '../../components/health/health-component.js';
import { ColliderComponent } from '../../components/collider/collider-component.js';
import * as CONFIG from '../../config.js';
import { CUSTOM_EVENTS } from "../../components/events/event-bus-component.js";
import { FreePlaneEnemy } from './free-plane-enemy.js';



export class AircraftCareer extends Phaser.GameObjects.Container {
    #isInitialized;
    #inputComponent;
    #weaponComponent;
    #verticalInputComponent;

    #healthComponent;
    #colliderComponent;
    #shipSprite;
    #shipEngineSprite;

    #eventBusComponent;
    #player;
    #spawnEvent;

    constructor(scene, x, y, player) {
        super(scene,x, y-400, []); //simple aircraft career spawn y correction. 
        // //though this should be done somewhere else
        console.log("y - 400: " + (y - 400));
        this.#player = player;
        this.#isInitialized = false;
        this.scene.add.existing(this); //add this, player, to the scene;
        this.scene.physics.add.existing(this); //add physics body to this container
        this.body.setSize(80, 300);
        this.body.setOffset(-40, -150);
        this.setDepth(0);
        this.#player = scene.player;
        
        this.#shipSprite = scene.add.sprite(0, 0, 'aircraft_career', 0).setFlipY(true);
        this.#shipSprite.setScale(0.8); // Scales to 50% size


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
        return '';
    }
    get shipDestroyedAnimationKey() {
        // const gameObject = this.#group.get(this.x, this.y, this.shipAssetKey, 0);
        //     gameObject.play({ });
        // return '';
        return 'aircraft_career_destroy';
    }

    init(eventBusComponent) {
        this.#eventBusComponent = eventBusComponent;
        this.#inputComponent = new BotFighterInputComponent();
        this.#verticalInputComponent = new VerticalMovementComponent(this, this.#inputComponent, CONFIG.ENEMY_AIRCRAFT_CAREER_MOVEMENT_VERTICAL_VELOCITY);
        this.#weaponComponent = new WeaponComponent(this, this.#inputComponent, {
            speed: CONFIG.ENEMY_AIRCRAFT_CAREER_BULLET_SPEED,
            interval: CONFIG.ENEMY_AIRCRAFT_CAREER_BULLET_INTERVAL,
            lifespan: CONFIG.ENEMY_AIRCRAFT_CAREER_BULLET_LIFESPAN,
            maxCount: CONFIG.ENEMY_AIRCRAFT_CAREER_BULLET_MAX_COUNT,
            yOffset: 10,
            flipY: true,
            },
            this.#eventBusComponent
        );

        
        this.#healthComponent = new HealthComponent(CONFIG.ENEMY_AIRCRAFT_CAREER_HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
        this.#isInitialized = true;


            // Spawn a bomber from the carrier
        //or pass the player in the constructor. 

// Store the event reference
        this.#spawnEvent = this.scene.time.addEvent({
                delay: 8000, // every 8 seconds
            callback: () => {

                if (this.#healthComponent.isDead) {
                    this.#spawnEvent.remove(false); // disables this event
                        return;
                }
            const bomberCheckpoints = [
                { x: this.x, y: this.y - 200 },
            { 
                x: Phaser.Math.Between(0, this.scene.scale.width), 
                y: Phaser.Math.Between(100, this.scene.scale.height - 100) 
            },
            { 
                x: Phaser.Math.Between(0, this.scene.scale.width), 
                y: Phaser.Math.Between(100, this.scene.scale.height - 100) 
            },
            { 
                x: Phaser.Math.Between(0, this.scene.scale.width), 
                y: Phaser.Math.Between(100, this.scene.scale.height - 100) 
            },
            { 
                //or return back to career, or destroy if there is no career, or generate a new random checkpoint
                //in the bomber dynamically
                x: this.scene.scale.width * 0.5, 
                y: this.scene.scale.height + 300 
            }
            ];
                this.spawnBomber(bomberCheckpoints, this.#player);
            },
            loop: true
        });

    };
  
    spawnBomber(checkpoints, player) {
        const bomber = new FreePlaneEnemy(
            this.scene,
            this.x, // spawn at carrier's current position
            this.y + 150,
            checkpoints,
            60, // speed
            player,
            this.#eventBusComponent
        );
        this.scene.add.existing(bomber);
        this.scene.events.emit('bomber-spawned', bomber);
        bomber.init(this.#eventBusComponent);
        return bomber;
    }

    reset() {
            this.setActive(true);
            this.setVisible(true);
            this.#healthComponent.reset();
            this.#verticalInputComponent.reset();
            this.y-=400; //to compensate for aircraft career 400 size.
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