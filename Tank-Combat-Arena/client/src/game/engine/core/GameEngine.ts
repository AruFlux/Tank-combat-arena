import * as PIXI from 'pixi.js';
import { useGameStore } from '../../store';
import { CONFIG } from './Config';
import { PlayerTank } from '../entities/PlayerTank';
import { EnemyTank } from '../entities/EnemyTank';
import { Projectile } from '../entities/Projectile';
import { randomRange } from '../utils/MathHelpers';

export class GameEngine {
  private app: PIXI.Application;
  private container: HTMLElement;
  private player: PlayerTank | null = null;
  private enemies: EnemyTank[] = [];
  private projectiles: Projectile[] = [];
  private keys: Set<string> = new Set();
  private mouseX: number = 0;
  private mouseY: number = 0;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.app = new PIXI.Application();
  }

  async init() {
    await this.app.init({ 
      resizeTo: this.container, 
      backgroundColor: 0x1a1a1a,
      antialias: true 
    });
    
    this.container.appendChild(this.app.canvas);
    
    // Setup Grid Background
    this.createGrid();

    // Event Listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);

    // Start Loop
    this.app.ticker.add((ticker) => this.update(ticker));
    
    this.spawnPlayer();
    this.spawnWave(1);
  }

  private createGrid() {
    const grid = new PIXI.Graphics();
    grid.strokeStyle = { width: 1, color: CONFIG.COLORS.GRID, alpha: 0.2 };
    
    for (let x = 0; x <= CONFIG.MAP_SIZE; x += CONFIG.GRID_SIZE) {
      grid.moveTo(x, 0);
      grid.lineTo(x, CONFIG.MAP_SIZE);
    }
    
    for (let y = 0; y <= CONFIG.MAP_SIZE; y += CONFIG.GRID_SIZE) {
      grid.moveTo(0, y);
      grid.lineTo(CONFIG.MAP_SIZE, y);
    }
    
    grid.stroke();
    this.app.stage.addChild(grid);
  }

  private spawnPlayer() {
    this.player = new PlayerTank(this.app.screen.width / 2, this.app.screen.height / 2);
    this.app.stage.addChild(this.player.view);
  }

  private spawnWave(waveNum: number) {
    const count = waveNum * 2 + 1;
    useGameStore.getState().updateStats({ enemiesAlive: count, wave: waveNum });

    for (let i = 0; i < count; i++) {
      let x, y;
      // Spawn away from player
      do {
          x = Math.random() * this.app.screen.width;
          y = Math.random() * this.app.screen.height;
      } while (this.player && Math.hypot(x - this.player.x, y - this.player.y) < 400);
      
      const enemy = new EnemyTank(x, y);
      this.enemies.push(enemy);
      this.app.stage.addChild(enemy.view);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => this.keys.add(e.code);
  private handleKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  
  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.app.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
  };

  private handleMouseDown = () => {
    if (this.player && !useGameStore.getState().isPaused) {
        // Player firing is handled in update loop or here? 
        // For semi-auto, here is fine.
        const globalRot = this.player.rotation + this.player.turret.rotation;
        const projectile = this.player.fire(globalRot);
        if (projectile) {
          this.projectiles.push(projectile);
          this.app.stage.addChild(projectile.view);
          useGameStore.getState().updateStats({ ammo: this.player.ammo });
        }
    }
  };

  private update(ticker: PIXI.Ticker) {
    if (useGameStore.getState().isPaused || useGameStore.getState().isGameOver) return;
    
    const dt = ticker.deltaTime;

    // --- PLAYER UPDATE ---
    if (this.player) {
      let throttle = 0;
      let turn = 0;
      
      if (this.keys.has('KeyW')) throttle = 1;
      if (this.keys.has('KeyS')) throttle = -1;
      if (this.keys.has('KeyA')) turn = -1;
      if (this.keys.has('KeyD')) turn = 1;

      this.player.move(throttle, turn, dt);
      this.player.aim(this.mouseX, this.mouseY, dt);
      this.player.update(dt);
      
      // Update UI state
      useGameStore.getState().updateStats({ 
        health: this.player.health,
        ammo: this.player.ammo,
        reloadProgress: this.player.getReloadProgress() 
      });
    }

    // --- PROJECTILES ---
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);
      
      // Collision Checks
      let hit = false;
      
      // Check vs Enemies
      if (p.source === 'player') {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          if (enemy.checkCollision(p)) {
            const result = enemy.hit(p);
            
            if (result.damage > 0) {
                this.createExplosion(p.x, p.y);
            } else {
                // Ricochet spark
                this.createExplosion(p.x, p.y, false); 
            }
            
            hit = true;
            break;
          }
        }
      } else {
        // Check vs Player
        if (this.player && this.player.checkCollision(p)) {
          const result = this.player.hit(p);
          
          if (result.damage > 0) {
              this.createExplosion(p.x, p.y);
              useGameStore.getState().updateStats({ health: this.player.health });
          } else {
              this.createExplosion(p.x, p.y, false);
          }

          hit = true;
          
          if (this.player.health <= 0) {
            this.gameOver();
          }
        }
      }

      // Cleanup
      if (hit || p.isDead()) {
        this.app.stage.removeChild(p.view);
        this.projectiles.splice(i, 1);
      }
    }

    // --- ENEMIES ---
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (this.player) {
        enemy.updateAI(this.player, dt);
        
        // Enemy firing (handled by AI state usually, but for now check flag)
        if (enemy.ai.wantsToFire) {
             const globalRot = enemy.rotation + enemy.turret.rotation;
             const p = enemy.fire(globalRot);
             if (p) {
               this.projectiles.push(p);
               this.app.stage.addChild(p.view);
             }
        }
      }
      enemy.update(dt);

      if (enemy.health <= 0) {
        this.createExplosion(enemy.x, enemy.y, true);
        this.app.stage.removeChild(enemy.view);
        this.enemies.splice(i, 1);
        
        // Score update
        const currentScore = useGameStore.getState().score;
        const currentEnemies = useGameStore.getState().enemiesAlive;
        useGameStore.getState().updateStats({ 
          score: currentScore + 100,
          enemiesAlive: currentEnemies - 1 
        });
      }
    }

    // --- WAVE LOGIC ---
    if (this.enemies.length === 0) {
      const currentWave = useGameStore.getState().wave;
      this.spawnWave(currentWave + 1);
    }
    
    // Camera Follow Player
    if (this.player) {
        const pivotX = this.player.x;
        const pivotY = this.player.y;
        const screenW = this.app.screen.width;
        const screenH = this.app.screen.height;
        
        // Simple clamp camera
        this.app.stage.position.x = screenW / 2 - pivotX;
        this.app.stage.position.y = screenH / 2 - pivotY;
    }
  }

  private createExplosion(x: number, y: number, big = false) {
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, big ? 30 : 5);
    graphics.fill(big ? CONFIG.COLORS.EXPLOSION : 0xFFFFFF);
    graphics.x = x;
    graphics.y = y;
    this.app.stage.addChild(graphics);
    
    setTimeout(() => {
      this.app.stage.removeChild(graphics);
    }, 200);
  }
  
  private gameOver() {
    useGameStore.getState().endGame(useGameStore.getState().score);
  }

  destroy() {
    this.app.destroy(true, { children: true });
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
  }
}
