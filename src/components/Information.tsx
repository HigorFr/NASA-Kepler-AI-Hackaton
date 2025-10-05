import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Users, BookOpen, Rocket } from "lucide-react";

const Information = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">About KEPLER</h2>
        <p className="text-muted-foreground">Our mission to advance exoplanet classification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Rocket className="w-5 h-5" />
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              KEPLER is an advanced AI-powered platform that leverages machine learning to classify
              exoplanet candidates from multiple space telescope missions.
            </p>
            <p>
              Our models process photometric data from NASA's KEPLER, TESS, and K2 missions to
              identify potential exoplanets with high accuracy and precision.
            </p>
            <p>
              By combining data from multiple sources and using state-of-the-art classification
              algorithms, we help astronomers quickly identify the most promising candidates for
              further study.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BookOpen className="w-5 h-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">1. Data Input</h4>
              <p>Enter observational parameters from telescope missions</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">2. AI Processing</h4>
              <p>Our trained models analyze the data using advanced algorithms</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">3. Classification</h4>
              <p>Receive instant A/B classification for exoplanet candidacy</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Users className="w-5 h-5" />
              Research Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p className="font-semibold text-foreground">Principal Investigators:</p>
            <p>Dr. Sarah Mitchell - Machine Learning Lead</p>
            <p>Dr. James Rodriguez - Astrophysics Specialist</p>
            <p>Dr. Emily Chen - Data Science Engineer</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Mail className="w-5 h-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Email:</p>
              <p>kepler-research@space.science.edu</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Research Institution:</p>
              <p>Space Science Institute</p>
              <p>Department of Astrophysics</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Collaboration Inquiries:</p>
              <p>collaborations@kepler-project.org</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Information;
