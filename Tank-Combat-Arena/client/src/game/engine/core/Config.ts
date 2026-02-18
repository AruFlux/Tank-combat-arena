import * as PIXI from 'pixi.js';

export const CONFIG = {
  MAP_SIZE: 2000,
  GRID_SIZE: 100,
  COLORS: {
    PLAYER: 0x228B22, // Forest Green
    ENEMY: 0x8B0000, // Dark Red
    PROJECTILE_PLAYER: 0xFFFF00,
    PROJECTILE_ENEMY: 0xFFA500,
    EXPLOSION: 0xFF5500,
    SMOKE: 0x333333,
    TRACKS: 0x111111,
    GRID: 0x333333
  },
  PHYSICS: {
    GRAVITY: 0,
    DRAG: 0.95,
    ANGULAR_DRAG: 0.9
  },
  // Game balance values
  SHELLS: {
    M829A3: { // APFSDS
        caliber: 120,
        penetration: 650, // mm RHA at 0m
        velocity: 1550, // m/s
        mass: 7.8, // kg
        explosive: false,
        dropoff: 0.05, // per 100m
        damage: 80,
        spall: true,
        color: 0x00FFFF
    },
    M830: { // HEAT
        caliber: 120,
        penetration: 480,
        velocity: 1140,
        mass: 13.5,
        explosive: true,
        blastRadius: 50,
        dropoff: 0.02,
        damage: 120,
        color: 0xFF4500
    },
    M393: { // HESH
        caliber: 120,
        penetration: 127,
        velocity: 730,
        mass: 15.0,
        explosive: true,
        spall: true,
        dropoff: 0.1,
        damage: 150,
        color: 0xFFA500
    }
  },
  ARMOR_ZONES: {
    M1_ABRAMS: {
        hullFrontUpper: { thickness: 600, angle: 45 },
        hullFrontLower: { thickness: 400, angle: 30 },
        hullSides: { thickness: 150, angle: 0 },
        hullRear: { thickness: 80, angle: 0 },
        turretFront: { thickness: 700, angle: 30 },
        turretSides: { thickness: 300, angle: 15 },
        turretRear: { thickness: 150, angle: 10 },
        turretTop: { thickness: 70, angle: 0 }
    }
  }
};
