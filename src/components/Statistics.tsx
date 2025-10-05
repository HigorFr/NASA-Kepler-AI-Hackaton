import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Award } from "lucide-react";

const Statistics = () => {
  const models = [
    {
      name: "KEPLER",
      f1Score: 0.81,
      recall: 1.00,
      predictions: 15234,
      precision: 1.00,
      icon: TrendingUp,
    },
    {
      name: "TESS",
      f1Score: 0.85,
      recall: 0.85,
      predictions: 12891,
      precision: 0.85,
      icon: Target,
    },
    {
      name: "K2",
      f1Score: 0.91,
      recall: 0.92,
      predictions: 18742,
      precision: 0.91,
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">Model Performance</h2>
        <p className="text-muted-foreground">Real-time statistics from our AI models</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => {
          const Icon = model.icon;
          return (
            <Card key={model.name} className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Icon className="w-5 h-5" />
                  {model.name}
                </CardTitle>
                <CardDescription>Classification Model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">F1-Score</span>
                    <span className="font-bold text-primary">{model.f1Score}%</span>
                  </div>
                  <Progress value={model.f1Score} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Precision</span>
                    <span className="font-bold text-primary">{model.precision}%</span>
                  </div>
                  <Progress value={model.precision} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recall</span>
                    <span className="font-bold text-primary">{model.recall}%</span>
                  </div>
                  <Progress value={model.recall} className="h-2" />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Predictions</span>
                    <span className="text-xl font-bold text-foreground">{model.predictions.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;