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
  const [keplerResult, setKeplerResult] = useState<PredictionResult>(null);
  const [tessResult, setTessResult] = useState<PredictionResult>(null);
  const [k2Result, setK2Result] = useState<PredictionResult>(null);

  const [isKeplerLoading, setIsKeplerLoading] = useState(false);
  const [isTessLoading, setIsTessLoading] = useState(false);
  const [isK2Loading, setIsK2Loading] = useState(false);

  const keplerSessionRef = useRef<ort.InferenceSession | null>(null);
  const tessSessionRef = useRef<ort.InferenceSession | null>(null);
  const k2SessionRef = useRef<ort.InferenceSession | null>(null);

  // Helper: Interpreta a saída do ONNX de forma genérica
  const parseOnnxOutput = (raw: any) => {
    let predArray: number[];

    if (raw?.data) {
      predArray = Array.from(raw.data);
    } else if (Array.isArray(raw)) {
      predArray = raw;
    } else {
      predArray = [raw];
    }

    // Se for probabilidades, pega o índice do maior valor
    const label = predArray.length > 1 ? predArray.indexOf(Math.max(...predArray)) : Math.round(predArray[0]);
    return label === 0 ? "CANDIDATE" : "NOT CANDIDATE";
  };

  const runModelPrediction = async (sessionRef: React.MutableRefObject<ort.InferenceSession | null>, modelPath: string, inputTensor: ort.Tensor) => {
    if (!sessionRef.current) {
      toast.info(`Loading model from ${modelPath}...`);
      ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.0/dist/';
      sessionRef.current = await ort.InferenceSession.create(modelPath);
    }
    const feeds = { float_input: inputTensor };
    const results = await sessionRef.current.run(feeds);
    const outputKey = Object.keys(results)[0];
    return parseOnnxOutput((results as any)[outputKey]);
  };

  const handleKeplerPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsKeplerLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const inputData = new Float32Array([
        parseFloat((form.elements.namedItem('koi_prad') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('koi_period') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('koi_score') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('koi_teq') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('koi_depth_log') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('koi_steff') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('koi_duration') as HTMLInputElement).value),
      ]);

      const inputTensor = new ort.Tensor('float32', inputData, [1, 7]);
      const result = await runModelPrediction(keplerSessionRef, '/models/Kepler_KOI_rf_model.onnx', inputTensor);
      setKeplerResult(result);
      toast.success(`KEPLER Model Prediction: ${result}`);
    } catch (error) {
      console.error("KEPLER prediction error:", error);
      toast.error("Failed to run KEPLER prediction. Check console.");
    } finally {
      setIsKeplerLoading(false);
    }
  };

  const handleTessPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTessLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const inputData = new Float32Array([
        parseFloat((form.elements.namedItem('pl_pnum') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('pl_tranmid') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('pl_orbper') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('pl_trandurh') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('pl_trandep') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('pl_rade') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('pl_eqt') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('ra') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('st_pmra') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('st_pmdec') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('st_tmag') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('st_dist') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('st_teff') as HTMLInputElement).value),
        parseFloat((form.elements.namedItem('st_rad') as HTMLInputElement).value),
      ]);

      const inputTensor = new ort.Tensor('float32', inputData, [1, 14]);
      const result = await runModelPrediction(tessSessionRef, '/models/TESS_lightGBM_model.onnx', inputTensor);
      setTessResult(result);
      toast.success(`TESS Model Prediction: ${result}`);
    } catch (error) {
      console.error("TESS prediction error:", error);
      toast.error("Failed to run TESS prediction. Check console.");
    } finally {
      setIsTessLoading(false);
    }
  };

  const handleK2Predict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsK2Loading(true);

    try {
      const form = e.target as HTMLFormElement;
      const inputData = new Float32Array([
        parseFloat((form.elements.namedItem("k2-trandep") as HTMLInputElement).value),
        parseFloat((form.elements.namedItem("k2-tranmid") as HTMLInputElement).value),
        parseFloat((form.elements.namedItem("k2-dec") as HTMLInputElement).value),
        parseFloat((form.elements.namedItem("k2-campaigns") as HTMLInputElement).value),
        parseFloat((form.elements.namedItem("k2-glat") as HTMLInputElement).value),
        parseFloat((form.elements.namedItem("k2-disc-year") as HTMLInputElement).value),
        parseFloat((form.elements.namedItem("k2-sy-pm") as HTMLInputElement).value),
        parseFloat((form.elements.namedItem("k2-elat") as HTMLInputElement).value),
        parseFloat((form.elements.namedItem("k2-elon") as HTMLInputElement).value),
        parseFloat((form.elements.namedItem("k2-sy-plx") as HTMLInputElement).value),
      ]);

      const inputTensor = new ort.Tensor("float32", inputData, [1, 10]);
      const result = await runModelPrediction(k2SessionRef, '/models/random_forest_K2_model.onnx', inputTensor);
      setK2Result(result);
      toast.success(`K2 Model Prediction: ${result}`);
    } catch (error) {
      console.error("K2 prediction error:", error);
      toast.error("Failed to run K2 prediction. Check console.");
    } finally {
      setIsK2Loading(false);
    }
  };

  return (
    <Tabs defaultValue="kepler" className="w-full">
      {/* Tabs List */}
      <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
        <TabsTrigger value="kepler" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Satellite className="w-4 h-4 mr-2" /> KEPLER
        </TabsTrigger>
        <TabsTrigger value="tess" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Telescope className="w-4 h-4 mr-2" /> TESS
        </TabsTrigger>
        <TabsTrigger value="k2" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Target className="w-4 h-4 mr-2" /> K2
        </TabsTrigger>
      </TabsList>

      {/* KEPLER Tab Content */}
      <TabsContent value="kepler" className="mt-6">
        {/* ... seu conteúdo KEPLER permanece igual, só o resultado agora usa keplerResult ... */}
      </TabsContent>

      {/* TESS Tab Content */}
      <TabsContent value="tess" className="mt-6">
        {/* ... seu conteúdo TESS permanece igual, usando tessResult ... */}
      </TabsContent>

      {/* K2 Tab Content */}
      <TabsContent value="k2" className="mt-6">
        {/* ... seu conteúdo K2 permanece igual, usando k2Result ... */}
      </TabsContent>
    </Tabs>
  );
};

export default ModelTabs;
