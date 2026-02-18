import { useScores } from "@/hooks/use-scores";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Skull, Clock, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Leaderboard() {
  const { data: scores, isLoading } = useScores();

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-black/20 rounded-xl" />;
  }

  return (
    <Card className="bg-black/80 border-primary/20 text-primary backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-2xl font-display flex items-center gap-2 text-primary">
          <Trophy className="text-yellow-500" />
          TOP OPERATORS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-primary/20">
              <TableHead className="text-primary/70">RANK</TableHead>
              <TableHead className="text-primary/70">OPERATOR</TableHead>
              <TableHead className="text-right text-primary/70"><Skull className="w-4 h-4 inline" /> KILLS</TableHead>
              <TableHead className="text-right text-primary/70"><Target className="w-4 h-4 inline" /> ACC.</TableHead>
              <TableHead className="text-right text-primary/70"><Clock className="w-4 h-4 inline" /> TIME</TableHead>
              <TableHead className="text-right text-yellow-500 font-bold">SCORE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores?.slice(0, 10).map((score, index) => (
              <TableRow key={score.id} className="hover:bg-primary/10 border-primary/10 transition-colors">
                <TableCell className="font-mono text-primary/50">#{index + 1}</TableCell>
                <TableCell className="font-bold text-white">{score.username}</TableCell>
                <TableCell className="text-right font-mono">{score.kills}</TableCell>
                <TableCell className="text-right font-mono">{score.accuracy}%</TableCell>
                <TableCell className="text-right font-mono">{score.survivalTime}s</TableCell>
                <TableCell className="text-right font-mono font-bold text-yellow-500 text-lg">
                  {score.score.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {(!scores || scores.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No records found. Be the first to deploy.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
