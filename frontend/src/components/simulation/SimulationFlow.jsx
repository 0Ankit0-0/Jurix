import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CaseForm from "@/components/Case/CaseForm";
import ProcessingScreen from "@/components/simulation/ProcessingScreen";
import { socket, simulationAPI } from "@/services/api";

/**
 * Main Simulation Flow Component
 * Orchestrates the flow between Create, Processing, and Simulation screens
 */
export default function SimulationFlow() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState("create");
  const [caseId, setCaseId] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Socket listeners for real-time progress
  useEffect(() => {
    if (currentScreen === "processing" && caseId) {
      socket.emit('join', caseId);

      const handleEvidenceProgress = (data) => {
        setProcessingProgress(data.progress);
      };

      const handleSimulationProgress = (data) => {
        setProcessingProgress(data.progress);
      };

      const handleComplete = () => {
        setProcessingProgress(100);
        setTimeout(() => {
          setCurrentScreen("simulation");
          navigate(`/simulation/${caseId}`);
        }, 500);
      };

      const handleError = (data) => {
        toast.error(data.message);
        setCurrentScreen("create");
      };

      socket.on('evidence_progress', handleEvidenceProgress);
      socket.on('simulation_progress', handleSimulationProgress);
      socket.on('complete', handleComplete);
      socket.on('error', handleError);

      return () => {
        socket.off('evidence_progress', handleEvidenceProgress);
        socket.off('simulation_progress', handleSimulationProgress);
        socket.off('complete', handleComplete);
        socket.off('error', handleError);
      };
    }
  }, [currentScreen, caseId, navigate]);

  // Handle case creation form submission
  const handleCreateCase = async (newCaseId) => {
    setCaseId(newCaseId);
    setCurrentScreen("processing");
    setProcessingProgress(0);

    // Start simulation
    try {
      await simulationAPI.start(newCaseId);
    } catch (error) {
      toast.error("Failed to start simulation");
      setCurrentScreen("create");
    }
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
