import { CUSTOM_EVENTS } from "../components/events/event-bus-component.js";
import * as CONFIG from "../config.js";

const ENEMY_SCORES = {
    FighterEnemy: CONFIG.ENEMY_FIGHTER_SCORE,
    ScoutEnemy: CONFIG.ENEMY_SCOUT_SCORE,
    FreePlaneEnemy: CONFIG.ENEMY_BOMBER_SCORE,
    AircraftCareer: CONFIG.ENEMY_AIRCRAFT_CAREER_SCORE,
    DestroyerEnemy: CONFIG.ENEMY_DESTROYER_SCORE
}


export class Score extends Phaser.GameObjects.Text {
    #score;
    #eventBusComponent;


  constructor(scene, eventBusComponent) {
    super(scene, scene.scale.width/2, 20, '0', {
        fontSize: '32px',
        color: '#ffeca0ff',
        stroke: '#000',
        strokeThickness: 2,
        fontFamily: 'pixelFont',
    });
    this.scene.add.existing(this);
    this.#eventBusComponent = eventBusComponent;
    this.#score = 0;
    this.setOrigin(0.5);

    this.#eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy) => {
        this.#score += ENEMY_SCORES[enemy.constructor.name] || 0;
        this.setText(this.#score.toString(10));
    });
}
}