import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Satellite, Telescope, Target } from "lucide-react";
import { toast } from "sonner";

type PredictionResult = "A" | "B" | null;

const ModelTabs = () => {
  const [keplerResult, setKeplerResult] = useState<PredictionResult>(null);
  const [tessResult, setTessResult] = useState<PredictionResult>(null);
  const [k2Result, setK2Result] = useState<PredictionResult>(null);

  const handleKeplerPredict = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock prediction - randomly choose A or B
    const result = Math.random() > 0.5 ? "A" : "B";
    setKeplerResult(result);
    toast.success(`KEPLER Model Prediction: ${result}`);
  };

  const handleTessPredict = (e: React.FormEvent) => {
    e.preventDefault();
    const result = Math.random() > 0.5 ? "A" : "B";
    setTessResult(result);
    toast.success(`TESS Model Prediction: ${result}`);
  };

  const handleK2Predict = (e: React.FormEvent) => {
    e.preventDefault();
    const result = Math.random() > 0.5 ? "A" : "B";
    setK2Result(result);
    toast.success(`K2 Model Prediction: ${result}`);
  };

  return (
    <Tabs defaultValue="kepler" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
        <TabsTrigger value="kepler" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Satellite className="w-4 h-4 mr-2" />
          KEPLER
        </TabsTrigger>
        <TabsTrigger value="tess" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Telescope className="w-4 h-4 mr-2" />
          TESS
        </TabsTrigger>
        <TabsTrigger value="k2" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Target className="w-4 h-4 mr-2" />
          K2
        </TabsTrigger>
      </TabsList>

      <TabsContent value="kepler" className="mt-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Satellite className="w-5 h-5" />
              KEPLER Model
            </CardTitle>
            <CardDescription>
              Exoplanet detection using transit photometry data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleKeplerPredict} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kepler-period">Orbital Period (days)</Label>
                  <Input id="kepler-period" type="number" step="0.001" placeholder="0.000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kepler-radius">Planet Radius (R⊕)</Label>
                  <Input id="kepler-radius" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kepler-temp">Stellar Temperature (K)</Label>
                  <Input id="kepler-temp" type="number" placeholder="0000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kepler-magnitude">Stellar Magnitude</Label>
                  <Input id="kepler-magnitude" type="number" step="0.01" placeholder="0.00" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Run Prediction
              </Button>
              {keplerResult && (
                <div className={`p-4 rounded-lg text-center font-bold text-2xl ${keplerResult === "A" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  Prediction: {keplerResult}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tess" className="mt-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Telescope className="w-5 h-5" />
              TESS Model
            </CardTitle>
            <CardDescription>
              Transiting Exoplanet Survey Satellite classification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTessPredict} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tess-flux">Normalized Flux</Label>
                  <Input id="tess-flux" type="number" step="0.0001" placeholder="0.0000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tess-depth">Transit Depth (%)</Label>
                  <Input id="tess-depth" type="number" step="0.001" placeholder="0.000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tess-duration">Transit Duration (hrs)</Label>
                  <Input id="tess-duration" type="number" step="0.1" placeholder="0.0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tess-snr">Signal-to-Noise Ratio</Label>
                  <Input id="tess-snr" type="number" step="0.1" placeholder="0.0" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Run Prediction
              </Button>
              {tessResult && (
                <div className={`p-4 rounded-lg text-center font-bold text-2xl ${tessResult === "A" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  Prediction: {tessResult}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="k2" className="mt-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              K2 Model
            </CardTitle>
            <CardDescription>
              K2 mission extended data analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleK2Predict} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="k2-brightness">Star Brightness</Label>
                  <Input id="k2-brightness" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-variability">Variability Index</Label>
                  <Input id="k2-variability" type="number" step="0.001" placeholder="0.000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-distance">Distance (parsecs)</Label>
                  <Input id="k2-distance" type="number" step="0.1" placeholder="0.0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-metallicity">Metallicity [Fe/H]</Label>
                  <Input id="k2-metallicity" type="number" step="0.01" placeholder="0.00" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Run Prediction
              </Button>
              {k2Result && (
                <div className={`p-4 rounded-lg text-center font-bold text-2xl ${k2Result === "A" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  Prediction: {k2Result}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ModelTabs;
