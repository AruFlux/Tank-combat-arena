import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Projectile } from './Projectile';
import { TankModule } from './Module';
import { CONFIG } from '../core/Config';
import { lerpAngle } from '../utils/MathHelpers';

export class Tank extends Entity {
  // Visuals
  hull: PIXI.Graphics;
  turret: PIXI.Graphics;
  barrel: PIXI.Graphics;
  tracks: PIXI.Graphics;
  
  // Stats
  health: number = 1000;
  maxHealth: number = 1000;
  armor: any;
  
  // Mechanics
  velocity: number = 0;
  maxSpeed: number = 2.5;
  turnRate: number = 0.05;
  turretTraverse: number = 0.08;
  
  // State
  isMoving: boolean = false;
  reloadTime: number = 2000; // ms
  lastFired: number = 0;
  ammo: number = 40;
  currentAmmoType: string = 'M829A3';
  
  // Modules
  modules: { [key: string]: TankModule } = {};
  
  // Recoil
  recoilOffset: number = 0;
  recoilRecovery: number = 0.5;

  constructor(x: number, y: number, color: number) {
    super(x, y);
    this.health = 1000;
    this.maxHealth = 1000;
    
    // Initialize Modules
    this.modules = {
        engine: new TankModule('Engine', 200, {x: -20, y: 0}, { speed: 0.4, turnRate: 0.5 }),
        tracks: new TankModule('Tracks', 150, {x: 0, y: 0}, { speed: 0.1, turnRate: 0.1 }),
        ammoRack: new TankModule('AmmoRack', 100, {x: 10, y: 0}, { reload: 2.0 }),
        gun: new TankModule('Gun', 150, {x: 10, y: 0}, { accuracy: 0.2 }),
        turretRing: new TankModule('TurretRing', 120, {x: 0, y: 0}, { turnRate: 0.2 })
    };
    
    // Setup Armor Zones (Simplified from Config for hit testing)
    this.armor = CONFIG.ARMOR_ZONES.M1_ABRAMS;

    // --- VISUALS ---
    // Tracks (under hull)
    this.tracks = new PIXI.Graphics();
    this.tracks.rect(-24, -32, 48, 64);
    this.tracks.fill(CONFIG.COLORS.TRACKS);
    this.view.addChild(this.tracks);

    // Hull
    this.hull = new PIXI.Graphics();
    // Complex hull shape
    this.hull.moveTo(-20, -30);
    this.hull.lineTo(20, -30);
    this.hull.lineTo(20, 30);
    this.hull.lineTo(-20, 30);
    this.hull.closePath();
    this.hull.fill(color);
    this.hull.stroke({ width: 2, color: 0x000000 });
    this.view.addChild(this.hull);
    
    // Turret Container (Rotates independently)
    this.turret = new PIXI.Graphics();
    
    // Barrel
    this.barrel = new PIXI.Graphics();
    this.barrel.rect(-3, -40, 6, 40);
    this.barrel.fill(0x333333);
    this.turret.addChild(this.barrel);
    
    // Turret Shape
    const turretBody = new PIXI.Graphics();
    turretBody.ellipse(0, 0, 15, 20);
    turretBody.fill(color);
    turretBody.stroke({ width: 2, color: 0x000000 });
    this.turret.addChild(turretBody);
    
    this.view.addChild(this.turret);
  }
  
  move(throttle: number, turn: number, dt: number) {
    // Apply module effects
    let currentMaxSpeed = this.maxSpeed;
    let currentTurnRate = this.turnRate;
    
    if (!this.modules.engine.functional) currentMaxSpeed *= this.modules.engine.effects.speed || 0.5;
    if (!this.modules.tracks.functional) {
        currentMaxSpeed *= 0.1;
        currentTurnRate *= 0.1;
    }

    // Physics
    if (throttle !== 0) {
        this.velocity += throttle * 0.1 * dt;
    } else {
        this.velocity *= CONFIG.PHYSICS.DRAG;
    }
    
    this.velocity = Math.max(Math.min(this.velocity, currentMaxSpeed), -currentMaxSpeed * 0.5);
    
    if (Math.abs(this.velocity) > 0.01) {
        this.isMoving = true;
        this.x += Math.sin(this.rotation) * this.velocity * dt;
        this.y -= Math.cos(this.rotation) * this.velocity * dt;
        
        // Turn only when moving (realistic for neutral steering tanks, but simpler here)
        // Or if neutral steering is allowed:
        this.rotation += turn * currentTurnRate * dt;
    } else {
        this.isMoving = false;
        // Allow neutral turn
        this.rotation += turn * currentTurnRate * 0.8 * dt;
    }
    
    this.updateView();
  }
  
  rotateTurret(targetAngle: number, dt: number) {
      let traverse = this.turretTraverse;
      if (!this.modules.turretRing.functional) traverse *= 0.2;
      
      // Calculate angle diff relative to hull
      // Target is global, hull is global. 
      // Local turret rotation = global turret - hull rotation
      
      const localTarget = targetAngle - this.rotation;
      this.turret.rotation = lerpAngle(this.turret.rotation, localTarget, traverse * dt);
  }
  
  fire(globalRotation: number): Projectile | null {
      const now = Date.now();
      let actualReload = this.reloadTime;
      if (!this.modules.ammoRack.functional) actualReload *= 2.0;

      if (now - this.lastFired < actualReload || this.ammo <= 0) return null;
      if (!this.modules.gun.functional) return null; // Gun broken
      
      this.lastFired = now;
      this.ammo--;
      
      // Recoil
      this.recoilOffset = 5;
      
      // Calculate muzzle position
      const offset = 40;
      const bx = this.x + Math.sin(globalRotation) * offset;
      const by = this.y - Math.cos(globalRotation) * offset;
      
      return new Projectile(bx, by, globalRotation, 'player', this.currentAmmoType);
  }
  
  checkCollision(p: Projectile): boolean {
    const dx = this.x - p.x;
    const dy = this.y - p.y;
    // Simple circle collision for now, radius 30
    return (dx*dx + dy*dy) < 900; 
  }

  hit(projectile: Projectile): { damage: number, penetration: boolean, ricochet: boolean } {
      // 1. Calculate impact angle
      // Projectile vector vs Tank vector
      // Simplification: assume hitting closest side
      
      // 2. Calculate effective armor
      // Randomly pick a zone for now (Front/Side/Rear) based on relative angle
      const relAngle = Math.abs(projectile.rotation - this.rotation); // Simplified
      let zone = 'hullFrontUpper'; // default
      // TODO: Proper angle checking
      
      const armorStat = this.armor[zone];
      
      // 3. Check penetration
      // Angle of impact logic would go here
      const effectivePen = projectile.getEffectivePenetration();
      
      if (effectivePen > armorStat.thickness) {
          // PENETRATION
          let damage = projectile.damage;
          
          // Apply Damage to Modules (Chance)
          if (Math.random() < 0.3) {
              const modules = Object.values(this.modules);
              const hitModule = modules[Math.floor(Math.random() * modules.length)];
              hitModule.damage(50);
          }
          
          this.health -= damage;
          return { damage, penetration: true, ricochet: false };
      } else {
          // BOUNCE / NON-PEN
          return { damage: 0, penetration: false, ricochet: true };
      }
  }

  update(dt: number) {
      // Recoil animation
      if (this.recoilOffset > 0) {
          this.recoilOffset -= this.recoilRecovery * dt;
          if (this.recoilOffset < 0) this.recoilOffset = 0;
          this.barrel.y = -40 + this.recoilOffset;
      }
  }
}
