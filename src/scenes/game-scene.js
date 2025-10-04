// @ts-nocheck

import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component.js';
import Phaser from '../lib/phaser.js';
import { FighterEnemy } from '../objects/enemies/fighter-enemy.js';
import { ScoutEnemy } from '../objects/enemies/scout-enemy.js';
import { AircraftCareer } from '../objects/enemies/aircraft-career.js';
import { Player } from '../objects/player.js';
import { FreePlaneEnemy } from "../objects/enemies/free-plane-enemy.js";
import * as CONFIG from '../config.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component.js';
import { EnemyDestroyedComponent } from '../components/spawners/enemy-destroyed-component.js';
import { DestroyerEnemy } from '../objects/enemies/destroyer-enemy.js';
import { WaterShader } from '../shaders/water-shader.js';
import { Score } from '../ui/score.js';
import { Lives } from '../ui/lives.js';
import { AudioManager } from '../objects/audio-manager.js';

// import { Score } from '../objects/ui/score.js';
// import { Lives } from '../objects/ui/lives.js';

export class GameScene extends Phaser.Scene {
  #background;
  player;
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.pack('asset_pack', 'assets/data/assets.json');
  }



  create() {
this.renderer.pipelines.add('WaterShader', new WaterShader(this.game));

     this.#background =   this.add.tileSprite(
        0, 0,
        this.scale.width, this.scale.height,
        'background'
    )
    .setOrigin(0, 0)
    .setDepth(0)
    .setPipeline('WaterShader');

    const eventBusComponent = new EventBusComponent();
    const player = new Player(this, eventBusComponent);
    this.player = player;
    // spawn enemies
    const scoutSpawner = new EnemySpawnerComponent(
      this,
      ScoutEnemy,
      {
        interval: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_START,
      },
      eventBusComponent
    );
    const fighterSpawner = new EnemySpawnerComponent(
      this,
      FighterEnemy,
      {
        interval: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_START,
      },
      eventBusComponent
    );

    new EnemyDestroyedComponent(this, eventBusComponent);

    // collisions for player and enemy groups
    this.physics.add.overlap(player, scoutSpawner.phaserGroup, (playerGameObject, enemyGameObject) => {
      if (!playerGameObject.active || !enemyGameObject.active) {
        return;
      }

      playerGameObject.colliderComponent.collideWithEnemyShip();
      enemyGameObject.colliderComponent.collideWithEnemyShip();
    });
    this.physics.add.overlap(player, fighterSpawner.phaserGroup, (playerGameObject, enemyGameObject) => {
      if (!playerGameObject.active || !enemyGameObject.active) {
        return;
      }

      playerGameObject.colliderComponent.collideWithEnemyShip();
      enemyGameObject.colliderComponent.collideWithEnemyShip();
    });
    eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (gameObject) => {
      if (gameObject.constructor.name !== 'FighterEnemy') {
        return;
      }

      this.physics.add.overlap(player, gameObject.weaponGameObjectGroup, (playerGameObject, projectileGameObject) => {
        if (!playerGameObject.active || !projectileGameObject.active) {
          return;
        }

        gameObject.weaponComponent.destroyBullet(projectileGameObject);
        playerGameObject.colliderComponent.collideWithEnemyProjectile();
      });
    });

    // collisions for player weapons and enemy groups
    this.physics.add.overlap(
      scoutSpawner.phaserGroup,
      player.weaponGameObjectGroup,
      (enemyGameObject, projectileGameObject) => {
        if (!enemyGameObject.active || !projectileGameObject.active) {
          return;
        }

        player.weaponComponent.destroyBullet(projectileGameObject);
        enemyGameObject.colliderComponent.collideWithEnemyProjectile();
      }
    );
    this.physics.add.overlap(
      fighterSpawner.phaserGroup,
      player.weaponGameObjectGroup,
      (enemyGameObject, projectileGameObject) => {
        if (!enemyGameObject.active || !projectileGameObject.active) {
          return;
        }

        player.weaponComponent.destroyBullet(projectileGameObject);
        enemyGameObject.colliderComponent.collideWithEnemyProjectile();
      }
    );



    // Example checkpoints for the path
    // const checkpoints = [
    //     { x: 100, y: 100 },
    //     { x: 700, y: 100 },
    //     { x: 700, y: 500 },
    //     { x: 100, y: 500 },
    //     { x: 400, y: 320 }
    // ];

    // // Spawn the enemy at the first checkpoint
    // const pathEnemy = new FreePlaneEnemy(this, checkpoints[0].x, checkpoints[0].y, checkpoints, 120, player);

    // this.physics.add.overlap(
    //   pathEnemy,
    //   player.weaponGameObjectGroup,
    //   (enemyGameObject, projectileGameObject) => {
    //     if (!enemyGameObject.active || !projectileGameObject.active) {
    //       return;
    //     }
    //     player.weaponComponent.destroyBullet(projectileGameObject);
    //     enemyGameObject.colliderComponent.collideWithEnemyProjectile();
    //   }
    // );

    // this.physics.add.overlap(
    //   player,
    //   pathEnemy.weaponGameObjectGroup,
    //   (playerGameObject, projectileGameObject) => {
    //     if (!playerGameObject.active || !projectileGameObject.active) {
    //       return;
    //     }
    //     pathEnemy.weaponComponent.destroyBullet(projectileGameObject);
    //     playerGameObject.colliderComponent.collideWithEnemyProjectile();
    //   }
    // );

    // const AircraftCareerEnemy = new AircraftCareer(this, this.scale.width / 2, 0);
    const AircraftCareerSpawner = new EnemySpawnerComponent (
      this,
      AircraftCareer,
      {
        interval: CONFIG.ENEMY_AIRCRAFT_CAREER_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_AIRCRAFT_CAREER_GROUP_SPAWN_START,
      },
      eventBusComponent
    );

    this.physics.add.overlap(
      AircraftCareerSpawner.phaserGroup,
      player.weaponGameObjectGroup,
      (enemyGameObject, projectileGameObject) => {
        if (!enemyGameObject.active || !projectileGameObject.active) {
          return;
        }

        player.weaponComponent.destroyBullet(projectileGameObject);
        enemyGameObject.colliderComponent.collideWithEnemyProjectile();
      }
    );

    const DestroyerEnemySpawner = new EnemySpawnerComponent (
      this,
      DestroyerEnemy,
      {
        interval: CONFIG.ENEMY_DESTROYER_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_DESTROYER_GROUP_SPAWN_START,
      },
      eventBusComponent
    );

    this.physics.add.overlap(
      DestroyerEnemySpawner.phaserGroup,
      player.weaponGameObjectGroup,
      (enemyGameObject, projectileGameObject) => {
        if (!enemyGameObject.active || !projectileGameObject.active) {
          return;
        }

        player.weaponComponent.destroyBullet(projectileGameObject);
        enemyGameObject.colliderComponent.collideWithEnemyProjectile();
      }
      
    );

    eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (gameObject) => {
      if (gameObject.constructor.name !== 'DestroyerEnemy') {
        return;
      }

      // Player vs Destroyer bullets
      this.physics.add.overlap(
        this.player,
        gameObject.weaponGameObjectGroup,
        (playerGameObject, projectileGameObject) => {
          if (!playerGameObject.active || !projectileGameObject.active) {
            return;
          }

          gameObject.weaponComponent.destroyBullet(projectileGameObject);
          playerGameObject.colliderComponent.collideWithEnemyProjectile();
        }
      );
    });
    

    // game-scene.js (inside create())
    this.events.on('bomber-spawned', (bomber) => {
        // Player bullets vs bomber
        this.physics.add.overlap(
            bomber,
            this.player.weaponGameObjectGroup,
            (enemyGameObject, projectileGameObject) => {
                if (!enemyGameObject.active || !projectileGameObject.active) return;
                this.player.weaponComponent.destroyBullet(projectileGameObject);
                enemyGameObject.colliderComponent.collideWithEnemyProjectile();
            }
        );

        // Bomber bullets vs player
        this.physics.add.overlap(
            this.player,
            bomber.weaponGameObjectGroup,
            (playerGameObject, projectileGameObject) => {
                if (!playerGameObject.active || !projectileGameObject.active) return;
                bomber.weaponComponent.destroyBullet(projectileGameObject);
                playerGameObject.colliderComponent.collideWithEnemyProjectile();
            }
        );
    });
    new Score(this, eventBusComponent);
    new Lives(this, eventBusComponent);
    new AudioManager(this, eventBusComponent);
  }

  

  update(t, dt) {
    this.#background.tilePositionY -= 0.5;

  }
}
