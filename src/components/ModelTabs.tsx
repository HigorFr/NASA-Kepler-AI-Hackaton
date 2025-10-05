import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Satellite, Telescope, Target } from "lucide-react";
import { toast } from "sonner";
import * as ort from "onnxruntime-web";

type PredictionResult = "CANDIDATE" | "NOT CANDIDATE" | null;

const ModelTabs = () => {
  // Estados dos modelos
  const [keplerInputs, setKeplerInputs] = useState({
    koi_prad: "", koi_period: "", koi_score: "",
    koi_teq: "", koi_depth_log: "", koi_steff: "", koi_duration: ""
  });
  const [tessInputs, setTessInputs] = useState({
    pl_pnum: "", pl_tranmid: "", pl_orbper: "", pl_trandurh: "", pl_trandep: "",
    pl_rade: "", pl_eqt: "", ra: "", st_pmra: "", st_pmdec: "",
    st_tmag: "", st_dist: "", st_teff: "", st_rad: ""
  });
  const [k2Inputs, setK2Inputs] = useState({
    trandep: "", tranmid: "", dec: "", campaigns: "", glat: "",
    disc_year: "", sy_pm: "", elat: "", elon: "", sy_plx: ""
  });

  const [keplerResult, setKeplerResult] = useState<PredictionResult>(null);
  const [tessResult, setTessResult] = useState<PredictionResult>(null);
  const [k2Result, setK2Result] = useState<PredictionResult>(null);

  const [isKeplerLoading, setIsKeplerLoading] = useState(false);
  const [isTessLoading, setIsTessLoading] = useState(false);
  const [isK2Loading, setIsK2Loading] = useState(false);

  const keplerSessionRef = useRef<ort.InferenceSession | null>(null);
  const tessSessionRef = useRef<ort.InferenceSession | null>(null);
  const k2SessionRef = useRef<ort.InferenceSession | null>(null);

  // Função genérica para atualizar inputs dinamicamente
  const handleChange = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setter((prev: any) => ({ ...prev, [name]: value }));
  };

  // Human-friendly labels / descriptions for inputs
  const keplerLabels: Record<string, string> = {
    koi_prad: "Planetary Radius (Earth radii)",
    koi_period: "Orbital Period (days)",
    koi_score: "Disposition Score",
    koi_teq: "Equilibrium Temperature (K)",
    koi_depth_log: "log(Transit Depth) (ppm)",
    koi_steff: "Stellar Effective Temperature (K)",
    koi_duration: "Transit Duration (hours)",
  };

  const tessLabels: Record<string, string> = {
    pl_pnum: "Planet Number",
    pl_tranmid: "Transit Midpoint (BJD)",
    pl_orbper: "Orbital Period (days)",
    pl_trandurh: "Transit Duration (hours)",
    pl_trandep: "Transit Depth (ppm)",
    pl_rade: "Planet Radius (Earth radii)",
    pl_eqt: "Equilibrium Temperature (K)",
    ra: "Right Ascension (deg)",
    st_pmra: "Proper Motion RA (mas/yr)",
    st_pmdec: "Proper Motion Dec (mas/yr)",
    st_tmag: "TESS Magnitude",
    st_dist: "Distance (pc)",
    st_teff: "Stellar Effective Temperature (K)",
    st_rad: "Stellar Radius (Solar radii)",
  };

  const k2Labels: Record<string, string> = {
    trandep: "Transit Depth (ppm)",
    tranmid: "Transit Midpoint (BJD)",
    dec: "Declination (deg)",
    campaigns: "Campaigns",
    glat: "Galactic Latitude (deg)",
    disc_year: "Discovery Year",
    sy_pm: "System Proper Motion (mas/yr)",
    elat: "Ecliptic Latitude (deg)",
    elon: "Ecliptic Longitude (deg)",
    sy_plx: "Parallax (mas)",
  };

  // Função auxiliar para ler valor numérico de tensor
  const extractPrediction = (results: Record<string, ort.Tensor>): number => {
    const outputKey = Object.keys(results)[0];
    const raw = results[outputKey];
    const value = Array.isArray(raw.data) ? raw.data[0] : raw.data;
    return Number(value);
  };

  const handleKeplerPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsKeplerLoading(true);
    try {
      if (!keplerSessionRef.current) {
        toast.info("Loading KEPLER model...");
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.0/dist/';
        keplerSessionRef.current = await ort.InferenceSession.create('/models/Kepler_KOI_rf_model.onnx');
      }

  // Parse inputs robustly (ensure strings are cast to numbers); empty -> 0
  const values = Object.values(keplerInputs).map(v => Number(String(v)) || 0);
      const inputTensor = new ort.Tensor('float32', new Float32Array(values), [1, values.length]);
      const results = await keplerSessionRef.current.run({ float_input: inputTensor });

      const prediction = extractPrediction(results);
      const result: PredictionResult = prediction >= 0.5 ? "CANDIDATE" : "NOT CANDIDATE";
      setKeplerResult(result);
      toast.success(`KEPLER Model Prediction: ${result}`);
    } catch (err) {
      console.error("KEPLER prediction error:", err);
      toast.error("Failed to run KEPLER prediction.");
    } finally {
      setIsKeplerLoading(false);
    }
  };

  const handleTessPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTessLoading(true);
    try {
      if (!tessSessionRef.current) {
        toast.info("Loading TESS model...");
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.0/dist/';
        tessSessionRef.current = await ort.InferenceSession.create('/models/TESS_lightGBM_model.onnx');
      }

  const values = Object.values(tessInputs).map(v => Number(String(v)) || 0);
      const inputTensor = new ort.Tensor('float32', new Float32Array(values), [1, values.length]);
      const results = await tessSessionRef.current.run({ float_input: inputTensor });

      const prediction = extractPrediction(results);
      const result: PredictionResult = prediction >= 0.5 ? "CANDIDATE" : "NOT CANDIDATE";
      setTessResult(result);
      toast.success(`TESS Model Prediction: ${result}`);
    } catch (err) {
      console.error("TESS prediction error:", err);
      toast.error("Failed to run TESS prediction.");
    } finally {
      setIsTessLoading(false);
    }
  };

  const handleK2Predict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsK2Loading(true);
    try {
      if (!k2SessionRef.current) {
        toast.info("Loading K2 model...");
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.0/dist/';
        k2SessionRef.current = await ort.InferenceSession.create("/models/random_forest_K2_model.onnx");
      }

  const values = Object.values(k2Inputs).map(v => Number(String(v)) || 0);
      const inputTensor = new ort.Tensor('float32', new Float32Array(values), [1, values.length]);
      const results = await k2SessionRef.current.run({ float_input: inputTensor });

      const prediction = extractPrediction(results);
      const result: PredictionResult = prediction >= 0.5 ? "CANDIDATE" : "NOT CANDIDATE";
      setK2Result(result);
      toast.success(`K2 Model Prediction: ${result}`);
    } catch (err) {
      console.error("K2 prediction error:", err);
      toast.error("Failed to run K2 prediction.");
    } finally {
      setIsK2Loading(false);
    }
  };

  return (
    <Tabs defaultValue="kepler" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
        <TabsTrigger value="kepler"><Satellite className="w-4 h-4 mr-2" />KEPLER</TabsTrigger>
        <TabsTrigger value="tess"><Telescope className="w-4 h-4 mr-2" />TESS</TabsTrigger>
        <TabsTrigger value="k2"><Target className="w-4 h-4 mr-2" />K2</TabsTrigger>
      </TabsList>

        <div className="mt-4 text-sm text-muted-foreground">
          <div className="mb-2">
            Inputs are numeric. Empty values will be treated as 0 for the model run.
          </div>
          <div className="p-2 bg-muted rounded">
            <strong>Kepler column mapping example:</strong>
            <div className="text-xs mt-1">
              koi_prad = Planetary Radius, koi_period = Orbital Period, koi_score = Disposition Score, koi_teq = Equilibrium Temperature, koi_depth_log = log(Transit Depth), koi_steff = Stellar Teff, koi_duration = Transit Duration
            </div>
          </div>
          <div className="mt-2 text-xs text-foreground/70">
            <em>Decision tree model: far-from-seen or random inputs may generate unpredictable results according to the tree path.</em>
          </div>
        </div>

      {/* KEPLER */}
      <TabsContent value="kepler" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Kepler Model</CardTitle>
            <CardDescription>
              <a href="https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=cumulative" target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Get Kepler test data</a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleKeplerPredict} className="space-y-4">
              {Object.keys(keplerInputs).map((key) => (
                <div key={key}>
                  <Label htmlFor={key}>{keplerLabels[key] ?? key}</Label>
                  <Input id={key} name={key} type="number" placeholder={keplerLabels[key] ?? key} value={keplerInputs[key as keyof typeof keplerInputs]} onChange={handleChange(setKeplerInputs)} required />
                </div>
              ))}
              <Button type="submit" disabled={isKeplerLoading}>
                {isKeplerLoading ? "Running..." : "Run Prediction"}
              </Button>
              {keplerResult && (
                <div className={`p-4 mt-4 text-center font-bold text-xl rounded-lg ${keplerResult === "CANDIDATE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {keplerResult}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      {/* TESS */}
      <TabsContent value="tess" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>TESS Model</CardTitle>
            <CardDescription>
              <a href="https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=TOI" target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Get TESS (TOI) test data</a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTessPredict} className="space-y-4">
              {Object.keys(tessInputs).map((key) => (
                <div key={key}>
                  <Label htmlFor={key}>{tessLabels[key] ?? key}</Label>
                  <Input id={key} name={key} type="number" placeholder={tessLabels[key] ?? key} value={tessInputs[key as keyof typeof tessInputs]} onChange={handleChange(setTessInputs)} required />
                </div>
              ))}
              <Button type="submit" disabled={isTessLoading}>
                {isTessLoading ? "Running..." : "Run Prediction"}
              </Button>
              {tessResult && (
                <div className={`p-4 mt-4 text-center font-bold text-xl rounded-lg ${tessResult === "CANDIDATE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {tessResult}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* K2 */}
      <TabsContent value="k2" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>K2 Model</CardTitle>
            <CardDescription>
              <a href="https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=k2pandc" target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Get K2 test data</a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleK2Predict} className="space-y-4">
              {Object.keys(k2Inputs).map((key) => (
                <div key={key}>
                  <Label htmlFor={key}>{k2Labels[key] ?? key}</Label>
                  <Input id={key} name={key} type="number" placeholder={k2Labels[key] ?? key} value={k2Inputs[key as keyof typeof k2Inputs]} onChange={handleChange(setK2Inputs)} required />
                </div>
              ))}
              <Button type="submit" disabled={isK2Loading}>
                {isK2Loading ? "Running..." : "Run Prediction"}
              </Button>
              {k2Result && (
                <div className={`p-4 mt-4 text-center font-bold text-xl rounded-lg ${k2Result === "CANDIDATE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {k2Result}
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
