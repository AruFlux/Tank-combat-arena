import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaderboard } from "@/components/Leaderboard";
import { motion } from "framer-motion";
import { Play, Crosshair, ShieldAlert } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://pixabay.com/get/g61d1b1f3a5585fd5ce15592265fafad98f23cb50c5fcf1b1c1d3a5d7955eef42e6952bfbca274a37ffdc27b6d09c1ed00d2982381f621e241b11ebe491be7331_1280.jpg')] bg-cover bg-center opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      <div className="scanlines" />

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
               <Crosshair className="w-8 h-8 text-black animate-spin-slow" />
             </div>
             <div>
               <h1 className="text-3xl font-bold tracking-tighter text-primary leading-none">IRON</h1>
               <h1 className="text-3xl font-bold tracking-tighter text-white leading-none">VANGUARD</h1>
             </div>
          </div>
          <div className="flex gap-4 text-xs font-mono text-primary/60">
            <div>SYS.STATUS: <span className="text-primary">ONLINE</span></div>
            <div>SERVER: <span className="text-primary">US-EAST</span></div>
            <div>VER: <span className="text-primary">0.9.2</span></div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Hero & Actions */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 mb-4 border border-yellow-500/30 text-yellow-500 text-xs font-bold tracking-[0.2em] rounded-full bg-yellow-500/10">
                TACTICAL SIMULATION
              </div>
              <h2 className="text-6xl md:text-7xl font-display uppercase leading-none mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                Armored<br/>Warfare
              </h2>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed mb-8">
                Command the M1 Abrams in a high-intensity survival simulation. 
                Engage T-90M hostiles with realistic ballistics and module-based damage systems.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/play" className="w-full sm:w-auto">
                  <Button className="w-full h-16 text-xl px-8 bg-primary hover:bg-primary/90 text-black font-bold tracking-widest shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-all transform hover:-translate-y-1">
                    <Play className="mr-3 fill-black" /> DEPLOY NOW
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto h-16 text-lg px-8 border-white/20 hover:bg-white/5 hover:text-white">
                  BRIEFING
                </Button>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group">
                <ShieldAlert className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-bold text-white mb-1">MODULE DAMAGE</h3>
                <p className="text-xs text-gray-400">Critical hits disable engine, tracks, or ammo racks.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group">
                <Crosshair className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-bold text-white mb-1">BALLISTICS</h3>
                <p className="text-xs text-gray-400">APFSDS physics with penetration decay and angles.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent blur-xl opacity-50" />
            <Leaderboard />
          </motion.div>
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-primary/20" />
      <div className="fixed bottom-0 left-0 w-1/4 h-1 bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
    </div>
  );
}
