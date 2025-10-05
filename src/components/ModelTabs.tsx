import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Satellite, Telescope, Target } from "lucide-react";
import { toast } from "sonner";
import * as ort from "onnxruntime-web";

type PredictionResult = "A" | "B" | null;

const ModelTabs = () => {
  const [keplerResult, setKeplerResult] = useState<PredictionResult>(null);
  const [tessResult, setTessResult] = useState<PredictionResult>(null);
  const [k2Result, setK2Result] = useState<PredictionResult>(null);
  const [isKeplerLoading, setIsKeplerLoading] = useState(false);
  const [isK2Loading, setIsK2Loading] = useState(false);
  const k2SessionRef = useRef<ort.InferenceSession | null>(null);
  const keplerSessionRef = useRef<ort.InferenceSession | null>(null);

  const handleKeplerPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsKeplerLoading(true);

    try {
      if (!keplerSessionRef.current) {
        toast.info("Loading KEPLER model...");
        // Configure ONNX Runtime WASM paths (CDN) to avoid local wasm loading issues
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.0/dist/';
        // Model file served from public/model/xgboostKepler_model.onnx -> URL: /model/xgboostKepler_model.onnx
        keplerSessionRef.current = await ort.InferenceSession.create('/model/xgboostKepler_model.onnx');
      }

      const form = e.target as HTMLFormElement;
      const koi_prad = parseFloat((form.elements.namedItem('koi_prad') as HTMLInputElement).value);
      const koi_period = parseFloat((form.elements.namedItem('koi_period') as HTMLInputElement).value);
      const koi_score = parseFloat((form.elements.namedItem('koi_score') as HTMLInputElement).value);
      const koi_teq = parseFloat((form.elements.namedItem('koi_teq') as HTMLInputElement).value);
      const koi_depth_log = parseFloat((form.elements.namedItem('koi_depth_log') as HTMLInputElement).value);
      const koi_steff = parseFloat((form.elements.namedItem('koi_steff') as HTMLInputElement).value);
      const koi_duration = parseFloat((form.elements.namedItem('koi_duration') as HTMLInputElement).value);

      const inputData = new Float32Array([
        koi_prad,
        koi_period,
        koi_score,
        koi_teq,
        koi_depth_log,
        koi_steff,
        koi_duration,
      ]);
      const inputTensor = new ort.Tensor('float32', inputData, [1, 7]);

      const feeds: Record<string, ort.Tensor> = { float_input: inputTensor };
      const results = await keplerSessionRef.current.run(feeds);

      const outputKey = Object.keys(results)[0];
      // Try to extract numeric prediction safely
      const raw = (results as any)[outputKey];
      const prediction = Array.isArray(raw?.data) ? raw.data[0] : (raw?.data ?? raw?.[0] ?? raw);
      const result: PredictionResult = prediction === 0 ? 'A' : 'B';
      setKeplerResult(result);
      toast.success(`KEPLER Model Prediction: ${result}`);
    } catch (error) {
      console.error('KEPLER prediction error:', error);
      toast.error('Failed to run KEPLER prediction. Check console for details.');
    } finally {
      setIsKeplerLoading(false);
    }
  };

  const handleTessPredict = (e: React.FormEvent) => {
    e.preventDefault();
    const result = Math.random() > 0.5 ? "A" : "B";
    setTessResult(result);
    toast.success(`TESS Model Prediction: ${result}`);
  };

  const handleK2Predict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsK2Loading(true);
    
    try {
      // Load the ONNX model if not already loaded
      if (!k2SessionRef.current) {
        toast.info("Loading K2 model...");
        // Configure ONNX Runtime to use CDN for WASM files
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.0/dist/';
        k2SessionRef.current = await ort.InferenceSession.create("/models/random_forest_K2_model.onnx");
      }

      // Get form values
      const form = e.target as HTMLFormElement;
      const pl_trandep = parseFloat((form.elements.namedItem("k2-trandep") as HTMLInputElement).value);
      const pl_tranmid = parseFloat((form.elements.namedItem("k2-tranmid") as HTMLInputElement).value);
      const dec = parseFloat((form.elements.namedItem("k2-dec") as HTMLInputElement).value);
      const k2_campaigns_num = parseFloat((form.elements.namedItem("k2-campaigns") as HTMLInputElement).value);
      const glat = parseFloat((form.elements.namedItem("k2-glat") as HTMLInputElement).value);
      const disc_year = parseFloat((form.elements.namedItem("k2-disc-year") as HTMLInputElement).value);
      const sy_pm = parseFloat((form.elements.namedItem("k2-sy-pm") as HTMLInputElement).value);
      const elat = parseFloat((form.elements.namedItem("k2-elat") as HTMLInputElement).value);
      const elon = parseFloat((form.elements.namedItem("k2-elon") as HTMLInputElement).value);
      const sy_plx = parseFloat((form.elements.namedItem("k2-sy-plx") as HTMLInputElement).value);

      // Prepare input tensor with all 10 features
      const inputData = new Float32Array([
        pl_trandep, pl_tranmid, dec, k2_campaigns_num, glat,
        disc_year, sy_pm, elat, elon, sy_plx
      ]);
      const inputTensor = new ort.Tensor("float32", inputData, [1, 10]);

      // Run inference
      const feeds = { float_input: inputTensor };
      const results = await k2SessionRef.current.run(feeds);
      
      // Get prediction (assuming output is named 'output' or 'label')
      const outputKey = Object.keys(results)[0];
      const prediction = results[outputKey].data[0];
      
      // Convert prediction to A or B
      const result: PredictionResult = prediction === 0 ? "A" : "B";
      setK2Result(result);
      toast.success(`K2 Model Prediction: ${result}`);
    } catch (error) {
      console.error("K2 prediction error:", error);
      toast.error("Failed to run K2 prediction. Check console for details.");
    } finally {
      setIsK2Loading(false);
    }
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
                  <Label htmlFor="koi_prad">Planet Radius (koi_prad)</Label>
                  <Input id="koi_prad" name="koi_prad" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="koi_period">Orbital Period (koi_period)</Label>
                  <Input id="koi_period" name="koi_period" type="number" step="0.001" placeholder="0.000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="koi_score">Disposition Score (koi_score)</Label>
                  <Input id="koi_score" name="koi_score" type="number" step="0.001" placeholder="0.000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="koi_teq">Equilibrium Temperature (koi_teq)</Label>
                  <Input id="koi_teq" name="koi_teq" type="number" step="1" placeholder="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="koi_depth_log">Transit Depth (log ppm) (koi_depth_log)</Label>
                  <Input id="koi_depth_log" name="koi_depth_log" type="number" step="0.0001" placeholder="0.0000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="koi_steff">Stellar Effective Temperature (koi_steff)</Label>
                  <Input id="koi_steff" name="koi_steff" type="number" placeholder="0000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="koi_duration">Transit Duration (hrs) (koi_duration)</Label>
                  <Input id="koi_duration" name="koi_duration" type="number" step="0.1" placeholder="0.0" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isKeplerLoading}>
                {isKeplerLoading ? 'Running...' : 'Run Prediction'}
              </Button>
              {keplerResult && (
                <div className={`p-4 rounded-lg text-center font-bold text-2xl ${keplerResult === 'A' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
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
                  <Label htmlFor="k2-trandep">Transit Depth [%]</Label>
                  <Input id="k2-trandep" name="k2-trandep" type="number" step="0.001" placeholder="0.000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-tranmid">Transit Midpoint [days]</Label>
                  <Input id="k2-tranmid" name="k2-tranmid" type="number" step="0.001" placeholder="0.000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-dec">Declination [decimal]</Label>
                  <Input id="k2-dec" name="k2-dec" type="number" step="0.0001" placeholder="0.0000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-campaigns">K2 Campaigns Number</Label>
                  <Input id="k2-campaigns" name="k2-campaigns" type="number" placeholder="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-glat">Galactic Latitude [deg]</Label>
                  <Input id="k2-glat" name="k2-glat" type="number" step="0.0001" placeholder="0.0000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-disc-year">Discovery Year</Label>
                  <Input id="k2-disc-year" name="k2-disc-year" type="number" placeholder="2000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-sy-pm">System Proper Motion</Label>
                  <Input id="k2-sy-pm" name="k2-sy-pm" type="number" step="0.001" placeholder="0.000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-elat">Ecliptic Latitude [deg]</Label>
                  <Input id="k2-elat" name="k2-elat" type="number" step="0.0001" placeholder="0.0000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-elon">Ecliptic Longitude [deg]</Label>
                  <Input id="k2-elon" name="k2-elon" type="number" step="0.0001" placeholder="0.0000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="k2-sy-plx">Parallax [mas]</Label>
                  <Input id="k2-sy-plx" name="k2-sy-plx" type="number" step="0.001" placeholder="0.000" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isK2Loading}>
                {isK2Loading ? "Running..." : "Run Prediction"}
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
