export interface ModuleStats {
    speed?: number;
    turnRate?: number;
    reload?: number;
    accuracy?: number;
}

export class TankModule {
    name: string;
    health: number;
    maxHealth: number;
    location: { x: number, y: number }; // Offset from center
    functional: boolean = true;
    effects: ModuleStats;
    
    constructor(name: string, maxHealth: number, location: {x: number, y: number}, effects: ModuleStats) {
        this.name = name;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.location = location;
        this.effects = effects;
    }
    
    damage(amount: number) {
        this.health = Math.max(0, this.health - amount);
        if (this.health === 0) {
            this.functional = false;
            // Effects are applied by the Tank class checking functional status
        }
    }
    
    repair() {
        this.health = this.maxHealth;
        this.functional = true;
    }
}
