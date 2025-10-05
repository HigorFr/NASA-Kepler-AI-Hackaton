import { useState } from "react";
import ModelTabs from "@/components/ModelTabs";
import Statistics from "@/components/Statistics";
import Information from "@/components/Information";
import { Rocket } from "lucide-react";
import spaceHero from "@/assets/space-hero.jpg";

const Index = () => {
  const [activeSection, setActiveSection] = useState<"models" | "statistics" | "information">("models");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative bg-hero-gradient border-b border-primary/20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${spaceHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Rocket className="w-12 h-12 text-primary" />
            <h1 className="text-6xl font-bold text-primary">KEPLER</h1>
          </div>
          <p className="text-center text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced AI-Powered Exoplanet Classification System
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Analyzing data from NASA's KEPLER, TESS, and K2 missions
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-1 py-2">
            <button
              onClick={() => setActiveSection("models")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "models"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              AI Models
            </button>
            <button
              onClick={() => setActiveSection("statistics")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "statistics"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveSection("information")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "information"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Information
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {activeSection === "models" && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-primary mb-2">Select a Model</h2>
              <p className="text-muted-foreground">
                Choose from our three trained AI models to classify your exoplanet data
              </p>
            </div>
            <ModelTabs />
          </div>
        )}

        {activeSection === "statistics" && <Statistics />}

        {activeSection === "information" && <Information />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 KEPLER Project - Space Science Institute</p>
          <p className="mt-2">
            Data from NASA's KEPLER, TESS, and K2 missions | Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
