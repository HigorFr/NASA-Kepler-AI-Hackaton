<<<<<<< HEAD
import React, { useState, useRef } from "react";
=======
import { useState, useRef } from "react";
>>>>>>> 0bcd2c382dc103d9dc63e8182e9ffb94c09aa112
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Satellite, Telescope, Target } from "lucide-react";
import { toast } from "sonner";
import * as ort from "onnxruntime-web";

type PredictionResult = "CANDIDATE" | "NOT CANDIDATE" | null;

<<<<<<< HEAD
// Função genérica para extrair valor numérico de tensor
const extractPrediction = (results: Record<string, ort.Tensor>): number => {
  const outputKey = Object.keys(results)[0];
  const raw = (results as any)[outputKey];
  const data = raw?.data;
  if (Array.isArray(data)) return Number(data[0]);
  if (typeof raw === "number") return raw;
  return Number(raw?.value ?? raw?.data ?? raw);
};

=======
>>>>>>> 0bcd2c382dc103d9dc63e8182e9ffb94c09aa112
const ModelTabs = () => {
  // Estados de resultados e carregamento
  const [keplerResult, setKeplerResult] = useState<PredictionResult>(null);
  const [tessResult, setTessResult] = useState<PredictionResult>(null);
  const [k2Result, setK2Result] = useState<PredictionResult>(null);

  const [isKeplerLoading, setIsKeplerLoading] = useState(false);
  const [isTessLoading, setIsTessLoading] = useState(false);
  const [isK2Loading, setIsK2Loading] = useState(false);

  // Referências para sessões ONNX
  const keplerSessionRef = useRef<ort.InferenceSession | null>(null);
  const tessSessionRef = useRef<ort.InferenceSession | null>(null);
  const k2SessionRef = useRef<ort.InferenceSession | null>(null);

<<<<<<< HEAD
  // Função genérica de predição
  const handlePredict = async (
    e: React.FormEvent,
    sessionRef: React.MutableRefObject<ort.InferenceSession | null>,
    modelPath: string,
    inputValues: number[],
    setResult: React.Dispatch<React.SetStateAction<PredictionResult>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
=======
  const handleKeplerPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsKeplerLoading(true);

    try {
      if (!keplerSessionRef.current) {
        toast.info("Loading KEPLER model...");
        // Configure ONNX Runtime WASM paths (CDN) to avoid local wasm loading issues
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.0/dist/';
  // Model file is in public/models -> URL: /models/Kepler_KOI_rf_model.onnx
        keplerSessionRef.current = await ort.InferenceSession.create('/models/Kepler_KOI_rf_model.onnx');
        try {
          console.debug('KEPLER session inputs:', keplerSessionRef.current.inputNames);
          console.debug('KEPLER session outputs:', keplerSessionRef.current.outputNames);
        } catch (e) {
          console.debug('KEPLER session metadata unavailable', e);
        }
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
      const result: PredictionResult = prediction === 1 ? 'CANDIDATE' : 'NOT CANDIDATE';
      setKeplerResult(result);
      toast.success(`KEPLER Model Prediction: ${result}`);
    } catch (error) {
      console.error('KEPLER prediction error:', error);
      toast.error('Failed to run KEPLER prediction. Check console for details.');
    } finally {
      setIsKeplerLoading(false);
    }
  };

  const handleTessPredict = async (e: React.FormEvent) => {
>>>>>>> 0bcd2c382dc103d9dc63e8182e9ffb94c09aa112
    e.preventDefault();
    setLoading(true);

<<<<<<< HEAD
=======
      const inputData = new Float32Array([
        pl_pnum, pl_tranmid, pl_orbper, pl_trandurh, pl_trandep,
        pl_rade, pl_eqt, ra, st_pmra, st_pmdec,
        st_tmag, st_dist, st_teff, st_rad
      ]);
      const inputTensor = new ort.Tensor('float32', inputData, [1, 14]);

      const feeds: Record<string, ort.Tensor> = { float_input: inputTensor };
      const results = await tessSessionRef.current.run(feeds);
      const outputKey = Object.keys(results)[0];
      const raw = (results as any)[outputKey];
      const prediction = Number(Array.isArray(raw?.data) ? raw.data[0] : (raw?.data ?? raw?.[0] ?? raw));

      const result: PredictionResult = prediction === 1 ? 'CANDIDATE' : 'NOT CANDIDATE';
      setTessResult(result);
      toast.success(`TESS Model Prediction: ${result}`);
    } catch (error) {
      console.error('TESS prediction error:', error);
      toast.error('Failed to run TESS prediction. Check console for details.');
    } finally {
      setIsTessLoading(false);
    }
  };

  const handleK2Predict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsK2Loading(true);
    
>>>>>>> 0bcd2c382dc103d9dc63e8182e9ffb94c09aa112
    try {
      if (!sessionRef.current) {
        toast.info(`Loading model...`);
        ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.0/dist/";
        sessionRef.current = await ort.InferenceSession.create(modelPath);
      }

<<<<<<< HEAD
      const inputTensor = new ort.Tensor("float32", new Float32Array(inputValues), [1, inputValues.length]);
      const results = await sessionRef.current.run({ float_input: inputTensor });
      const prediction = extractPrediction(results);
      const result: PredictionResult = prediction >= 0.5 ? "CANDIDATE" : "NOT CANDIDATE";
      setResult(result);
      toast.success(`Prediction: ${result}`);
    } catch (err) {
      console.error("Prediction error:", err);
      toast.error("Failed to run prediction.");
=======
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
      const prediction = Number(Array.isArray(raw?.data) ? raw.data[0] : (raw?.data ?? raw?.[0] ?? raw));

      
      // Convert prediction to A or B
      
      const result: PredictionResult = prediction === 1 ? "CANDIDATE" : "NOT CANDIDATE";
      setK2Result(result);
      toast.success(`K2 Model Prediction: ${result}`);
    } catch (error) {
      console.error("K2 prediction error:", error);
      toast.error("Failed to run K2 prediction. Check console for details.");
>>>>>>> 0bcd2c382dc103d9dc63e8182e9ffb94c09aa112
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="kepler" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
        <TabsTrigger value="kepler">
          <Satellite className="w-4 h-4 mr-2" /> KEPLER
        </TabsTrigger>
        <TabsTrigger value="tess">
          <Telescope className="w-4 h-4 mr-2" /> TESS
        </TabsTrigger>
        <TabsTrigger value="k2">
          <Target className="w-4 h-4 mr-2" /> K2
        </TabsTrigger>
      </TabsList>

      {/* KEPLER */}
      <TabsContent value="kepler" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>KEPLER Model</CardTitle>
            <CardDescription>Exoplanet detection using transit photometry data</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                const form = e.target as HTMLFormElement;
                const inputValues = [
                  parseFloat((form.elements.namedItem("koi_prad") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("koi_period") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("koi_score") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("koi_teq") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("koi_depth_log") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("koi_steff") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("koi_duration") as HTMLInputElement).value),
                ];
                handlePredict(e, keplerSessionRef, "/models/Kepler_KOI_rf_model.onnx", inputValues, setKeplerResult, setIsKeplerLoading);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["koi_prad", "Planet Radius"],
                  ["koi_period", "Orbital Period"],
                  ["koi_score", "Disposition Score"],
                  ["koi_teq", "Equilibrium Temp"],
                  ["koi_depth_log", "Transit Depth (log ppm)"],
                  ["koi_steff", "Stellar Temp"],
                  ["koi_duration", "Transit Duration (hrs)"],
                ].map(([name, label]) => (
                  <div className="space-y-2" key={name}>
                    <Label htmlFor={name}>{label}</Label>
                    <Input id={name} name={name} type="number" step="0.01" placeholder="0.00" required />
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={isKeplerLoading}>
                {isKeplerLoading ? "Running..." : "Run Prediction"}
              </Button>
              {keplerResult && <div className={`p-4 mt-4 text-center font-bold rounded-lg ${keplerResult === "CANDIDATE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{keplerResult}</div>}
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TESS */}
      <TabsContent value="tess" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>TESS Model</CardTitle>
            <CardDescription>Transiting Exoplanet Survey Satellite classification</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                const form = e.target as HTMLFormElement;
                const inputValues = [
                  parseFloat((form.elements.namedItem("pl_pnum") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("pl_tranmid") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("pl_orbper") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("pl_trandurh") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("pl_trandep") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("pl_rade") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("pl_eqt") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("ra") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("st_pmra") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("st_pmdec") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("st_tmag") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("st_dist") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("st_teff") as HTMLInputElement).value),
                  parseFloat((form.elements.namedItem("st_rad") as HTMLInputElement).value),
                ];
                handlePredict(e, tessSessionRef, "/models/TESS_lightGBM_model.onnx", inputValues, setTessResult, setIsTessLoading);
              }}
              className="space-y-4"
            >
              {/* Inputs TESS */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["pl_pnum", "Number of Planets"],
                  ["pl_tranmid", "Transit Midpoint"],
                  ["pl_orbper", "Orbital Period"],
                  ["pl_trandurh", "Transit Duration"],
                  ["pl_trandep", "Transit Depth"],
                  ["pl_rade", "Planet Radius"],
                  ["pl_eqt", "Equilibrium Temp"],
                  ["ra", "Right Ascension"],
                  ["st_pmra", "Proper Motion RA"],
                  ["st_pmdec", "Proper Motion Dec"],
                  ["st_tmag", "TESS Magnitude"],
                  ["st_dist", "Distance (parsecs)"],
                  ["st_teff", "Effective Temperature"],
                  ["st_rad", "Stellar Radius"],
                ].map(([name, label]) => (
                  <div className="space-y-2" key={name}>
                    <Label htmlFor={name}>{label}</Label>
                    <Input id={name} name={name} type="number" step="0.01" placeholder="0.00" required />
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={isTessLoading}>
                {isTessLoading ? "Running..." : "Run Prediction"}
              </Button>
              {tessResult && <div className={`p-4 mt-4 text-center font-bold rounded-lg ${tessResult === "CANDIDATE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{tessResult}</div>}
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* K2 */}
      <TabsContent value="k2" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>K2 Model</CardTitle>
            <CardDescription>K2 mission extended data analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                const form = e.target as HTMLFormElement;
                const inputValues = [
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
                ];
                handlePredict(e, k2SessionRef, "/models/random_forest_K2_model.onnx", inputValues, setK2Result, setIsK2Loading);
              }}
              className="space-y-4"
            >
              {/* Inputs K2 */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["k2-trandep", "Transit Depth [%]"],
                  ["k2-tranmid", "Transit Midpoint [days]"],
                  ["k2-dec", "Declination"],
                  ["k2-campaigns", "Campaigns Number"],
                  ["k2-glat", "Galactic Latitude"],
                  ["k2-disc-year", "Discovery Year"],
                  ["k2-sy-pm", "System Proper Motion"],
                  ["k2-elat", "Ecliptic Latitude"],
                  ["k2-elon", "Ecliptic Longitude"],
                  ["k2-sy-plx", "Parallax [mas]"],
                ].map(([name, label]) => (
                  <div className="space-y-2" key={name}>
                    <Label htmlFor={name}>{label}</Label>
                    <Input id={name} name={name} type="number" step="0.001" placeholder="0.000" required />
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={isK2Loading}>
                {isK2Loading ? "Running..." : "Run Prediction"}
              </Button>
              {k2Result && <div className={`p-4 mt-4 text-center font-bold rounded-lg ${k2Result === "CANDIDATE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{k2Result}</div>}
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ModelTabs;
