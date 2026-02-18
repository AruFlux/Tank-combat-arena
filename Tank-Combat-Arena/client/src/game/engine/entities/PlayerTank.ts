import * as PIXI from 'pixi.js';
import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { CONFIG } from '../core/Config';

export class PlayerTank extends Tank {
  constructor(x: number, y: number) {
    super(x, y, CONFIG.COLORS.PLAYER);
    this.reloadTime = 4000; // 4s
  }
  
  aim(mouseX: number, mouseY: number, dt: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const targetRot = Math.atan2(dy, dx) + Math.PI/2;
    // Rotate turret independent of hull
    this.rotateTurret(targetRot, dt);
  }
}
