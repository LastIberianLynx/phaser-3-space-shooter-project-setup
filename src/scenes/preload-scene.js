import Phaser from '../lib/phaser.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.load.pack('asset_pack', 'assets/data/assets.json');
    // In your preload scene
    this.load.image('background', 'assets/images/piiixl/bg.gif');
  }

  create() {
    this.add.tileSprite(
        0, 0,
        this.scale.width, this.scale.height,
        'background'
    )
    .setOrigin(0, 0)
    .setDepth(0);
    this.#createAnimations();
        // this.add.image(this.scale.width / 2, this.scale.height / 2, 'background')
        // .setOrigin(0.5, 0.5)
        // .setDepth(0); // Make sure it's behind everything else
    this.scene.start('GameScene');

  }

  #createAnimations() {
    const data = this.cache.json.get('animations_json');
    data.forEach((animation) => {
        const frames =  animation.frames ? 
        this.anims.generateFrameNumbers(animation.assetKey, {frames:animation.frames}) : 
        this.anims.generateFrameNumbers(animation.assetKey);
        this.anims.create({
          key: animation.key,
          frames: frames,
            frameRate: animation.frameRate,
            repeat: animation.repeat
        });
    });
  }
}


