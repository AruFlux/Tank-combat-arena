import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { CONFIG } from '../core/Config';
import { dist, lerp } from '../utils/MathHelpers';

export interface ShellType {
    caliber: number;
    penetration: number;
    velocity: number;
    mass: number;
    explosive: boolean;
    blastRadius?: number;
    dropoff: number;
    damage: number;
    spall?: boolean;
    color: number;
}

export class Projectile extends Entity {
  vx: number;
  vy: number;
  life: number = 2000; // max range
  source: 'player' | 'enemy';
  damage: number;
  shell: ShellType;
  distanceTraveled: number = 0;
  startX: number;
  startY: number;
  
  constructor(x: number, y: number, rotation: number, source: 'player' | 'enemy', shellType: string) {
    super(x, y);
    this.rotation = rotation;
    this.source = source;
    this.startX = x;
    this.startY = y;
    
    // @ts-ignore
    this.shell = CONFIG.SHELLS[shellType] || CONFIG.SHELLS.M829A3;
    this.damage = this.shell.damage;
    
    // Velocity based on real m/s scaled down for game (e.g. 1/100)
    const speed = this.shell.velocity * 0.02; 
    this.vx = Math.sin(rotation) * speed;
    this.vy = -Math.cos(rotation) * speed;
    
    // Visuals
    const gfx = new PIXI.Graphics();
    gfx.rect(-2, -8, 4, 16);
    gfx.fill(this.shell.color);
    // Tracer effect
    gfx.alpha = 1.0;
    
    this.view.addChild(gfx);
    this.view.rotation = rotation;
  }
  
  update(dt: number) {
    const dx = this.vx * dt;
    const dy = this.vy * dt;
    
    this.x += dx;
    this.y += dy;
    this.distanceTraveled += Math.sqrt(dx*dx + dy*dy);
    
    this.life -= dt;
    this.updateView();
  }
  
  getEffectivePenetration(): number {
      // Penetration dropoff over distance (distance in "meters" approx pixels/10)
      const distanceMeters = this.distanceTraveled / 10;
      const dropoff = (distanceMeters / 100) * this.shell.dropoff;
      return Math.max(0, this.shell.penetration - dropoff);
  }
  
  isDead() {
    return this.life <= 0;
  }
}
