// @ts-nocheck
import Phaser from '../lib/phaser.js';

export class WaterShader extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
  constructor(game) {
    super({
      game,
      fragShader: `
        precision mediump float;
        uniform float     time;
        uniform sampler2D uMainSampler;
        varying vec2      outTexCoord;

        void main(void) {
          vec2 uv = outTexCoord;

          float wave1 = sin((uv.x * 8.0) + time * 1.2) * 0.02;
          float wave2 = cos((uv.x * 6.0) + time * 0.8) * 0.015;
          uv.y += wave1 + wave2;

          gl_FragColor = texture2D(uMainSampler, uv);
        }
      `
    });
  }

  onPreRender() {
    this.set1f('time', this.game.loop.time / 1000);
  }
}
