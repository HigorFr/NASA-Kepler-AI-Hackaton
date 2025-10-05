import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Users, BookOpen, Rocket } from "lucide-react";

// Import the team photos that currently exist in `src/assets`.
// Only `1.png` exists in the repo workspace; for other members we fall back
// to an initials avatar so the build doesn't break when images are missing.
import img1 from "../assets/1.png";
import img2 from "../assets/2.png";
import img3 from "../assets/3.png";
import img4 from "../assets/4.png";
import img5 from "../assets/5.jpeg";

const imageMap: Record<string, string> = {
  '1.png': img1,
  '2.png': img2,
  '3.png': img3,
  '4.png': img4,
  '5.png': img5,
  '5.jpeg': img5
};

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
              KEPLER is a student-built, AI-powered platform developed as part of the NASA Space
              Apps Challenge. Our team designed and trained the classification models used to
              identify exoplanet candidates across multiple space telescope missions.
            </p>
            <p>
              The models process photometric data from NASA's KEPLER, TESS, and K2 missions to
              identify potential exoplanets with high accuracy and precision—work that the team
              carried out during the project build and training phase.
            </p>
            <p>
              We are students from Universidade de São Paulo. This prototype was implemented over
              a two-day hackathon period during the Nasa Space Apps Challenge and showcases our
              training and integration work.
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
              <p>Receive instant CANDIDATE/NOT CANDIDATE classification for exoplanet candidacy based on our models</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Users className="w-5 h-5" />
              Development Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p className="font-semibold text-foreground">Team Members:</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Enrico Aranha', unit: 'USP - EACH', img: '1.png', initials: 'EA' },
                { name: 'Eduardo Almerida', unit: 'USP - EACH', img: '2.png', initials: 'ED' },
                { name: 'Higor Freitas', unit: 'USP - EACH', img: '3.png', initials: 'HF' },
                { name: 'Lucas Harada', unit: 'USP - POLI', img: '4.png', initials: 'LH' },
                { name: 'Nicolas Pinho', unit: 'USP - EACH', img: '5.png', initials: 'NP' }
              ].map((member) => (
                <div key={member.name} className="flex items-center gap-3">
                  {imageMap[member.img] ? (
                    // Use imported asset URL when available
                    <img src={imageMap[member.img]} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    // Fallback initials avatar when image not available
                    <div aria-hidden className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">{member.initials}</div>
                  )}
                  <div>
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.unit}</div>
                  </div>
                </div>
              ))}
            
            
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Mail className="w-5 h-5" />
              Training & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p className="font-semibold text-foreground">Notebooks (training & analysis):</p>
            <ul className="list-disc pl-5">
              <li><a className="text-primary underline" href="/notebooks/Analisek2Planet.ipynb" download>Download Analisek2Planet.ipynb</a></li>
              <li><a className="text-primary underline" href="/notebooks/AnaliseKOI.ipynb" download>Download AnaliseKOI.ipynb</a></li>
              <li><a className="text-primary underline" href="/notebooks/AnaliseTOI.ipynb" download>Download AnaliseTOI.ipynb</a></li>
            </ul>
            <p className="mt-2">
              These notebooks (available in the project's <code>src/assets</code> folder) contain the
              data preprocessing, feature engineering, model training and basic evaluation scripts
              used to build the classification models. The training data was sourced from public
              mission catalogs and light-curve archives for KEPLER, TESS and K2.
            </p>
            <p>
              For reproducibility, see the notebooks for exact data queries, preprocessing steps,
              and training hyperparameters. If you want a packaged dataset or trained weights,
              we can provide export instructions.


            </p>
            <p className="mt-2">
              <span className="font-semibold">Original sources: </span>
              <a className="text-primary underline" href="https://www.spaceappschallenge.org/2025/challenges/a-world-away-hunting-for-exoplanets-with-ai/?tab=resources" target="_blank" rel="noopener noreferrer">NASA Space Apps Challenge — A World Away: Hunting for Exoplanets with AI (resources)</a>
            </p>
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default Information;
