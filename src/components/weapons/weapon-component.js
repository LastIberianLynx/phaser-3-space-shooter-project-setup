import { CUSTOM_EVENTS } from "../events/event-bus-component.js";

export class WeaponComponent {
    #gameObject;
    #inputComponent;
    #bulletGroup;
    #bulletConfig;
    #fireBulletInterval;
    #eventBusComponent;


  constructor(gameObject, inputComponent, bulletConfig, eventBusComponent) {
    this.#gameObject = gameObject;
    this.#inputComponent = inputComponent;
    this.#bulletConfig = bulletConfig;
    this.#fireBulletInterval = 0; // milliseconds
    this.#eventBusComponent = eventBusComponent;

    this.#bulletGroup = this.#gameObject.scene.physics.add.group({
        name: `bullets-${Phaser.Math.RND.uuid()}`,
        enable: false,
  });
  this.#bulletGroup.createMultiple({
    key: 'bullet',
    quantity: this.#bulletConfig.maxCount,
    active: false,
    visible: false,
  });

    this.#gameObject.scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
        this.#gameObject.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.#gameObject.scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
    }, this);

 }

 get bulletGroup() {
    return this.#bulletGroup;
 }
    update(dt, direction = { x: 0, y: -1 }) { // default: down
        this.#fireBulletInterval -= dt;
        if (this.#fireBulletInterval > 0) {
            return;
        }

        if (this.#inputComponent.shootIsDown) {
            const bullet = this.#bulletGroup.getFirstDead();
            if (!bullet) return;

            const x = this.#gameObject.x;
            const y = this.#gameObject.y + this.#bulletConfig.yOffset;
            bullet.enableBody(true, x, y, true, true);

            // Set velocity based on direction and speed
            const speed = this.#bulletConfig.speed;
            bullet.body.setVelocity(direction.x * speed, direction.y * speed);

            bullet.setState(this.#bulletConfig.lifespan);
            bullet.play('bullet');
            bullet.setScale(0.8);
            bullet.body.setSize(14, 18);
            bullet.setFlipY(this.#bulletConfig.flipY);

            this.#fireBulletInterval = this.#bulletConfig.interval;
            if (this.#eventBusComponent)
                this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_SHOOT, this);
            
      
    }
  }
    worldStep(delta) {
    this.#bulletGroup.getChildren().forEach(bullet => {
        if(!bullet.active) {
            return;
        }
        bullet.state -= delta;
        if(bullet.state <= 0) {
            bullet.disableBody(true, true);
        }
    });

    }

    destroyBullet(bullet) {
        bullet.setState(0);

    }
}