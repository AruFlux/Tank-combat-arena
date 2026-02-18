import * as PIXI from 'pixi.js';
import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { CONFIG } from '../core/Config';
import { lerpAngle, dist } from '../utils/MathHelpers';
import { TacticalAI } from '../ai/TacticalAI';

export class EnemyTank extends Tank {
  ai: TacticalAI;
  targetX: number = 0;
  targetY: number = 0;

  constructor(x: number, y: number) {
    super(x, y, CONFIG.COLORS.ENEMY);
    this.reloadTime = 6000;
    this.ai = new TacticalAI(this);
    this.pickTarget();
  }
  
  pickTarget() {
    this.targetX = this.x + (Math.random() - 0.5) * 400;
    this.targetY = this.y + (Math.random() - 0.5) * 400;
  }
  
  updateAI(player: Tank, dt: number) {
      this.ai.update(player, dt);
  }
}
