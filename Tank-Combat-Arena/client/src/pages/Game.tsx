import { useEffect, useRef, useState } from "react";
import { GameEngine } from "@/game/engine/Core";
import { useGameStore } from "@/game/store";
import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateScore } from "@/hooks/use-scores";
import { Loader2, Play, RotateCcw, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { isPlaying, isGameOver, score, enemiesAlive, wave, startGame, reset } = useGameStore();
  const [username, setUsername] = useState("");
  const createScore = useCreateScore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (containerRef.current && !engineRef.current) {
      engineRef.current = new GameEngine(containerRef.current);
      engineRef.current.init();
    }
    
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleSubmitScore = async () => {
    if (!username) return;
    try {
      await createScore.mutateAsync({
        username,
        score,
        kills: (wave - 1) * 3 + (3 - enemiesAlive), // Rough estimate for demo
        accuracy: Math.floor(Math.random() * 30) + 70, // Mock accuracy
        survivalTime: 120, // Mock time
      });
      setLocation("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Game Canvas Container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* CRT Effects */}
      <div className="scanlines pointer-events-none" />
      <div className="vignette pointer-events-none" />

      {/* UI Overlay */}
      {isPlaying && !isGameOver && <HUD />}

      {/* Game Over Screen */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="max-w-md w-full p-8 border border-destructive bg-black/90 rounded-2xl shadow-2xl shadow-destructive/20 text-center">
              <h2 className="text-4xl font-display text-destructive mb-2 tracking-widest">M.I.A.</h2>
              <p className="text-muted-foreground mb-8">MISSION FAILED</p>
              
              <div className="mb-8 space-y-2">
                <div className="text-sm text-primary/70 uppercase">Final Score</div>
                <div className="text-5xl font-mono text-yellow-500 font-bold">{score.toLocaleString()}</div>
              </div>

              <div className="space-y-4">
                <Input 
                  placeholder="ENTER CALLSIGN" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase())}
                  className="bg-gray-900 border-primary/30 text-center font-mono text-lg uppercase tracking-widest h-12"
                  maxLength={10}
                />
                
                <Button 
                  onClick={handleSubmitScore}
                  disabled={createScore.isPending || !username}
                  className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-black"
                >
                  {createScore.isPending ? <Loader2 className="animate-spin mr-2" /> : "SUBMIT RECORD"}
                </Button>
                
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => { reset(); startGame(); engineRef.current?.destroy(); engineRef.current = new GameEngine(containerRef.current!); engineRef.current.init(); }} className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
                    <RotateCcw className="mr-2 w-4 h-4" /> RETRY
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/")} className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
                    <Home className="mr-2 w-4 h-4" /> BASE
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen Overlay (if needed inside Game component, though mostly handled by Home page) */}
      {!isPlaying && !isGameOver && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <Button 
             onClick={startGame}
             className="text-2xl px-12 py-8 bg-primary text-black font-display tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.4)]"
           >
             <Play className="mr-4 w-8 h-8 fill-current" /> DEPLOY
           </Button>
         </div>
      )}
    </div>
  );
}
