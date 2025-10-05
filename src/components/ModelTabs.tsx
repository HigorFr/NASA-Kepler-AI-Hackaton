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
  const [isK2Loading, setIsK2Loading] = useState(false);
  const k2SessionRef = useRef<ort.InferenceSession | null>(null);

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

  const handleK2Predict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsK2Loading(true);
    
    try {
      // Load the ONNX model if not already loaded
      if (!k2SessionRef.current) {
        toast.info("Loading K2 model...");
        // Prefer CPU execution provider to avoid loading WASM binaries in environments
        // where .wasm files aren't served correctly (common in dev servers).
        // If you want to use WASM for performance, copy the files from
        // node_modules/onnxruntime-web/dist/*.wasm into `public/onnxruntime/`
        // and set `ort.env.wasm.wasmPaths = '/onnxruntime/';` before creating the session.
        try {
          k2SessionRef.current = await ort.InferenceSession.create("/models/random_forest_K2_model.onnx", { executionProviders: ["cpu"] } as any);
        } catch (err) {
          // If CPU provider creation fails, fall back to default behavior (which will try WASM/webgpu)
          console.warn("Creating CPU session failed, falling back to default create():", err);
          // Attempt default create (may try to init WASM). Useful for debugging.
          k2SessionRef.current = await ort.InferenceSession.create("/models/random_forest_K2_model.onnx");
        }
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
      // Use the model's declared input name(s) instead of a hard-coded key.
      const session = k2SessionRef.current!;
      // Log available input/output metadata for easier debugging
      try {
        console.debug('K2 session input names:', (session as any).inputNames || Object.keys((session as any).inputMetadata || {}));
        console.debug('K2 session output names:', (session as any).outputNames || Object.keys((session as any).outputMetadata || {}));
      } catch (err) {
        console.debug('Could not read session metadata', err);
      }

      const inputNames = (session as any).inputNames || Object.keys((session as any).inputMetadata || {});
      const inputKey = inputNames && inputNames.length > 0 ? inputNames[0] : 'float_input';
      const feeds = { [inputKey]: inputTensor } as Record<string, any>;

      let results: Record<string, any>;
      try {
        results = await session.run(feeds);
      } catch (runErr) {
        console.warn('Initial run failed, attempting to recreate CPU session and retry run', runErr);
        // If run fails due to WASM/tensor issues, try to recreate with CPU provider and re-run
        try {
          k2SessionRef.current = await ort.InferenceSession.create("/models/random_forest_K2_model.onnx", { executionProviders: ["cpu"] } as any);
          results = await k2SessionRef.current.run(feeds);
        } catch (retryErr) {
          // Re-throw the original error if retry also fails
          throw retryErr || runErr;
        }
      }

      // Debug raw results to help troubleshoot different output shapes/names
      console.debug("K2 raw results:", results);

      // Robustly extract a numeric prediction from the results. Common cases:
      // - results['output_label'] is a Tensor-like object with .data
      // - some output is a Tensor-like object
      // - output is a plain number or an array of numbers
      let prediction: number | undefined;

      const tryExtract = (val: any): number | undefined => {
        if (val == null) return undefined;
        // ONNXRuntime Tensor-like object has a `data` property (TypedArray)
        if (typeof val === 'object' && 'data' in val && Array.isArray((val as any).data) === false && (val as any).data && (val as any).data.length !== undefined) {
          // data might be a TypedArray (Float32Array) or regular array-like
          const d = (val as any).data;
          if (d.length > 0) return d[0];
        }
        // If data is a plain array
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'number') return val[0];
        // If it's a plain number
        if (typeof val === 'number') return val;
        return undefined;
      };

      // Preferred output name
      prediction = tryExtract(results['output_label']);

      // Fallback: check other outputs
      if (prediction === undefined) {
        for (const k of Object.keys(results)) {
          if (k === 'output_label') continue;
          const val = (results as any)[k];
          const ext = tryExtract(val);
          if (ext !== undefined) {
            prediction = ext;
            console.debug(`Using output key '${k}' for prediction extraction.`);
            break;
          }
        }
      }

      if (prediction === undefined) {
        throw new Error("Não foi possível extrair label do modelo. Veja raw results: " + JSON.stringify(results));
      }

      // Converte para A ou B
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
