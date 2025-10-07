import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CaseForm from "@/components/Case/CaseForm";
import ProcessingScreen from "@/components/simulation/ProcessingScreen";

/**
 * Main Simulation Flow Component
 * Orchestrates the flow between Create, Processing, and Simulation screens
 */
export default function SimulationFlow() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState("create");
  const [caseId, setCaseId] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Simulate processing progress
  useEffect(() => {
    if (currentScreen === "processing") {
      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setCurrentScreen("simulation");
              navigate(`/simulation/${caseId}`);
            }, 500);
            return 100;
          }
          return prev + 5;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [currentScreen, caseId, navigate]);

  // Handle case creation form submission
  const handleCreateCase = (newCaseId) => {
    setCaseId(newCaseId);
    setCurrentScreen("processing");
    setProcessingProgress(0);
  };

  // Render current screen
  switch (currentScreen) {
    case "create":
      return <CaseForm onCreated={handleCreateCase} />;

    case "processing":
      return (
        <ProcessingScreen
          progress={processingProgress}
          estimatedTime="3-5 minutes"
          steps={[
            { label: "Uploading Evidence", active: processingProgress < 25, completed: processingProgress >= 25 },
            { label: "Parsing Documents", active: processingProgress >= 25 && processingProgress < 50, completed: processingProgress >= 50 },
            { label: "Analyzing Case", active: processingProgress >= 50 && processingProgress < 75, completed: processingProgress >= 75 },
            { label: "Finalizing", active: processingProgress >= 75, completed: processingProgress >= 100 },
          ]}
        />
      );

    case "simulation":
      navigate(`/simulation/${caseId}`);
      return null;

    default:
      return null;
  }
}
