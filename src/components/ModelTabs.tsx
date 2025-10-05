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

      const values = Object.values(keplerInputs).map(v => parseFloat(v));
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

      const values = Object.values(tessInputs).map(v => parseFloat(v));
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

      const values = Object.values(k2Inputs).map(v => parseFloat(v));
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

      {/* KEPLER */}
      <TabsContent value="kepler" className="mt-6">
        <Card>
          <CardHeader><CardTitle>Kepler Model</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleKeplerPredict} className="space-y-4">
              {Object.keys(keplerInputs).map((key) => (
                <div key={key}>
                  <Label htmlFor={key}>{key}</Label>
                  <Input id={key} name={key} type="number" value={keplerInputs[key as keyof typeof keplerInputs]} onChange={handleChange(setKeplerInputs)} required />
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
    </Tabs>
  );
};

export default ModelTabs;
