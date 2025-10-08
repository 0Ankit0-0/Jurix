import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WaveGridBackground from "@/components/ui/WaveGridBackground";

export default function GridBackgroundFixPreview() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fullscreen Grid Background with Glowing Particles */}
      <WaveGridBackground />
      
      <div className="relative z-10 container mx-auto p-8">
        <Card className="max-w-2xl mx-auto mt-20 glass-card">
          <CardHeader>
            <CardTitle>Grid Background with Glowing Particles Restored</CardTitle>
            <CardDescription>
              The fullscreen grid background now includes animated glowing particles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">✨ Features restored:</span>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Fullscreen grid pattern</li>
                <li>• Animated glowing particles (100 particles)</li>
                <li>• Pulsing glow effects</li>
                <li>• Particle movement and wrapping</li>
                <li>• Theme-aware colors (golden for light, cyan for dark)</li>
                <li>• Highlight streaks animation</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <h3 className="text-lg font-semibold mb-2">Preview</h3>
              <p className="text-sm text-muted-foreground">
                The background you see behind this card is the restored fullscreen grid 
                with glowing particles. The particles pulse, move, and create a dynamic 
                animated effect across the entire screen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}