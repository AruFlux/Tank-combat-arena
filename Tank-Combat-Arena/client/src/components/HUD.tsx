import { useGameStore } from "@/game/store";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Crosshair, Shield, Zap, Target } from "lucide-react";

export function HUD() {
  const { score, health, ammo, maxAmmo, wave, enemiesAlive, reloadProgress } = useGameStore();

  const healthPercentage = Math.max(0, health);
  const ammoPercentage = (ammo / maxAmmo) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between text-primary font-mono tracking-widest">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1 bg-black/50 p-4 rounded border border-primary/20 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground uppercase">Score</div>
          <div className="text-4xl font-bold font-display">{score.toLocaleString().padStart(6, '0')}</div>
        </div>
        
        <div className="flex flex-col items-end gap-1 bg-black/50 p-4 rounded border border-primary/20 backdrop-blur-sm">
           <div className="flex items-center gap-2 text-xl font-bold text-destructive">
             <Target className="w-5 h-5" />
             <span>WAVE {wave}</span>
           </div>
           <div className="text-sm text-destructive-foreground animate-pulse">
             HOSTILES: {enemiesAlive}
           </div>
        </div>
      </div>

      {/* Reticle / Center UI */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 opacity-50">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 5" />
          <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end gap-8">
        {/* Health */}
        <div className="w-72 bg-black/50 p-4 rounded border border-primary/20 backdrop-blur-sm">
          <div className="flex justify-between mb-2">
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> HULL INTEGRITY</span>
            <span className={`${health < 30 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>{health}%</span>
          </div>
          <Progress value={healthPercentage} className="h-4 bg-gray-900 border border-gray-700" indicatorClassName={health < 30 ? 'bg-red-600' : 'bg-primary'} />
        </div>

        {/* Ammo & Reload */}
        <div className="w-72 bg-black/50 p-4 rounded border border-primary/20 backdrop-blur-sm">
          <div className="flex justify-between mb-2">
             <span className="flex items-center gap-2"><Crosshair className="w-4 h-4" /> AMMUNITION</span>
             <span className={`${ammo === 0 ? 'text-red-500' : 'text-primary'}`}>{ammo} / {maxAmmo}</span>
          </div>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className={`h-2 flex-1 rounded-sm ${i < (ammo / 2) ? 'bg-yellow-500' : 'bg-gray-800'}`} 
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-3 h-3 text-blue-400" /> 
            <span className="text-muted-foreground">RELOAD</span>
            <div className="flex-1 h-1 bg-gray-900">
              <div 
                className="h-full bg-blue-500 transition-all duration-75" 
                style={{ width: `${reloadProgress * 100}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
