import { Tank } from '../entities/Tank';
import { dist, angleTo } from '../utils/MathHelpers';

// --- Behavior Tree Nodes ---
abstract class Node {
    abstract execute(ai: TacticalAI, dt: number): 'SUCCESS' | 'FAILURE' | 'RUNNING';
}

class Selector extends Node {
    children: Node[];
    constructor(children: Node[]) { super(); this.children = children; }
    execute(ai: TacticalAI, dt: number) {
        for (const child of this.children) {
            const status = child.execute(ai, dt);
            if (status !== 'FAILURE') return status;
        }
        return 'FAILURE';
    }
}

class Sequence extends Node {
    children: Node[];
    constructor(children: Node[]) { super(); this.children = children; }
    execute(ai: TacticalAI, dt: number) {
        for (const child of this.children) {
            const status = child.execute(ai, dt);
            if (status !== 'SUCCESS') return status;
        }
        return 'SUCCESS';
    }
}

// --- Leaf Nodes (Actions/Conditions) ---

class CheckHealthLow extends Node {
    execute(ai: TacticalAI) {
        return ai.tank.health < ai.tank.maxHealth * 0.3 ? 'SUCCESS' : 'FAILURE';
    }
}

class Retreat extends Node {
    execute(ai: TacticalAI, dt: number) {
        if (!ai.target) return 'FAILURE';
        // Move AWAY from target
        const angle = angleTo(ai.target.x, ai.target.y, ai.tank.x, ai.tank.y); // Angle FROM target TO tank
        const dx = Math.sin(angle);
        const dy = -Math.cos(angle);
        
        // Turn towards retreat direction
        const targetRot = angle;
        const diff = targetRot - ai.tank.rotation;
        const turn = diff > 0 ? 1 : -1; // Simplified
        
        ai.tank.move(1, turn, dt); // Full throttle
        return 'RUNNING';
    }
}

class CheckCanSeePlayer extends Node {
    execute(ai: TacticalAI) {
        if (!ai.target) return 'FAILURE';
        const d = dist(ai.tank.x, ai.tank.y, ai.target.x, ai.target.y);
        // Field of view check could go here
        return d < 600 ? 'SUCCESS' : 'FAILURE';
    }
}

class Engage extends Node {
    execute(ai: TacticalAI, dt: number) {
        if (!ai.target) return 'FAILURE';
        
        // 1. Aim
        const angle = angleTo(ai.tank.x, ai.tank.y, ai.target.x, ai.target.y);
        ai.tank.rotateTurret(angle, dt);
        
        // 2. Move (Stop to shoot accurately, or move if far)
        const d = dist(ai.tank.x, ai.tank.y, ai.target.x, ai.target.y);
        if (d > 300) {
            // Move towards
            // Simplified movement logic
            const moveAngle = angle;
            const targetRot = moveAngle;
            // Simple turn logic
            let turn = 0;
            const diff = targetRot - ai.tank.rotation;
            if (Math.abs(diff) > 0.1) turn = Math.sign(diff);
            
            ai.tank.move(0.5, turn, dt);
        } else {
            // Stop and Rotate hull to face enemy (stronger armor)
            // ai.tank.move(0, ...);
        }
        
        // 3. Fire
        // Check if aiming close enough
        const aimDiff = Math.abs(ai.tank.turret.rotation + ai.tank.rotation - angle); // Global rotation diff
        // Normalized angle check skipped for brevity
        
        if (ai.tank.canFire()) { // Using simple check for now, ideally check aim
             ai.wantsToFire = true;
        }
        
        return 'RUNNING';
    }
}

class Patrol extends Node {
    execute(ai: TacticalAI, dt: number) {
        // Random movement
        ai.patrolTimer += dt;
        if (ai.patrolTimer > 100) {
            ai.patrolTimer = 0;
            ai.patrolTurn = Math.random() * 2 - 1;
        }
        ai.tank.move(0.5, ai.patrolTurn, dt);
        return 'RUNNING';
    }
}

// --- Main AI Class ---

export class TacticalAI {
    tank: Tank;
    target: Tank | null = null;
    root: Node;
    
    // Blackboard / State
    wantsToFire: boolean = false;
    patrolTimer: number = 0;
    patrolTurn: number = 0;

    constructor(tank: Tank) {
        this.tank = tank;
        
        // Build Tree
        // Root -> Selector
        //   1. Sequence (Health Low -> Retreat)
        //   2. Sequence (See Player -> Engage)
        //   3. Patrol
        
        this.root = new Selector([
            new Sequence([new CheckHealthLow(), new Retreat()]),
            new Sequence([new CheckCanSeePlayer(), new Engage()]),
            new Patrol()
        ]);
    }
    
    update(target: Tank, dt: number) {
        this.target = target;
        this.wantsToFire = false;
        this.root.execute(this, dt);
    }
}
