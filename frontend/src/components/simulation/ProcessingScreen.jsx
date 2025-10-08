import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, Brain, CircleCheck } from "lucide-react";
import { simulationAPI } from "@/services/api";
import toast from "react-hot-toast";
import ProcessingBackground from "@/components/ui/ProcessingBackground";

/** Get icon for processing step */
function getStepIcon(index) {
  const icons = [FileText, Search, Brain, CircleCheck];
  return icons[index] || FileText;
}

/** Processing Step Item */
function ProcessingStepItem({ step, index }) {
  const Icon = getStepIcon(index);

  const stepClasses = step.active
    ? "bg-primary/10 border-primary/30"
    : step.completed
      ? "bg-success/10 border-success/30"
      : "bg-muted/50 border-border";

  const iconClasses = step.active
    ? "bg-primary text-primary-foreground"
    : step.completed
      ? "bg-success text-white"
      : "bg-muted text-muted-foreground";

  const textClasses = step.active
    ? "text-primary"
    : step.completed
      ? "text-success"
      : "text-muted-foreground";

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${stepClasses}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${iconClasses}`}>
        {step.completed ? <CircleCheck className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <p className={`font-semibold text-sm ${textClasses}`}>{step.label}</p>
        {step.active && <p className="text-xs text-muted-foreground mt-1 animate-pulse">Processing...</p>}
      </div>
    </div>
  );
}

/** Processing Screen Component */
export default function ProcessingScreen() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasEvidence, setHasEvidence] = useState(true); // Assume evidence until checked
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const startSimulation = async () => {
      try {
        console.log(`🚀 Triggering simulation for case: ${caseId}`);
        await simulationAPI.start(caseId);
        toast.success("Simulation process initiated!");
      } catch (error) {
        console.error("Error starting simulation:", error);
        toast.error("Failed to start simulation. Redirecting back.");
        if (isMounted) {
          setTimeout(() => navigate(`/dashboard`), 2000);
        }
      }
    };

    startSimulation();

    return () => {
      isMounted = false;
    };
  }, [caseId, navigate]);


  const steps = hasEvidence
    ? [
      { label: "Parsing Evidence", active: currentStep === 0, completed: currentStep > 0 },
      { label: "Analyzing Case", active: currentStep === 1, completed: currentStep > 1 },
      { label: "Running AI Simulation", active: currentStep === 2, completed: currentStep > 2 },
      { label: "Finalizing", active: currentStep === 3, completed: currentStep > 3 },
    ]
    : [
      { label: "Preparing Case", active: currentStep === 0, completed: currentStep > 0 },
      { label: "Running AI Simulation", active: currentStep === 1, completed: currentStep > 1 },
      { label: "Finalizing", active: currentStep === 2, completed: currentStep > 2 },
    ];

  const animateProgress = (targetProgress) => {
    const animate = () => {
      setProgress((prev) => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.5) {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          return targetProgress;
        }
        return prev + diff * 0.1;
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    let isActive = true;

    async function pollStatus() {
      if (!isActive) return;

      try {
        const response = await simulationAPI.getStatus(caseId);
        const statusData = response.data;

        if (!isActive) return;

        setHasEvidence(statusData.has_evidence);

        if (statusData.completed) {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          animateProgress(100);
          setCurrentStep(steps.length);
          toast.success("Simulation complete!");
          setTimeout(() => {
            if (isActive) navigate(`/simulation/${caseId}`);
          }, 800);
          return;
        }

        // Enhanced progress calculation based on backend status
        const backendProgress = statusData.progress || 0;
        const backendStep = statusData.step || 0;
        
        // Calculate estimated progress based on step if backend doesn't provide it
        let estimatedProgress = backendProgress;
        if (backendProgress === 0 && backendStep > 0) {
          estimatedProgress = (backendStep / steps.length) * 100;
        }

        const newProgress = Math.max(estimatedProgress, progress);
        animateProgress(newProgress);

        setCurrentStep(backendStep);

      } catch (error) {
        console.error("Error polling simulation status:", error);
      }
    }

    pollStatus();
    pollingIntervalRef.current = setInterval(pollStatus, 1000); // Poll more frequently for smoother updates

    return () => {
      isActive = false;
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [caseId, navigate, hasEvidence, steps.length, progress]);

  // Timeout for simulation
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setError("Simulation timed out after 5 minutes. Please try again.");
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    }, 300000); // 5 minutes

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-border/30 glass-card">
          <CardHeader className="space-y-4 text-center pb-8">
            <CardTitle className="text-3xl font-heading font-bold text-red-500">Error</CardTitle>
            <CardDescription className="text-base text-muted-foreground">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <ProcessingBackground progress={progress / 100} />
      <Card className="w-full max-w-2xl shadow-2xl border-border/30 glass-card">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-heading font-bold text-foreground">
            Processing Your Case
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {hasEvidence
              ? "Our AI is analyzing your case details and evidence..."
              : "Preparing your case for simulation..."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold text-foreground">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <ProcessingStepItem key={index} step={{ ...step, active: currentStep === index, completed: currentStep > index }} index={index} />
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {hasEvidence
                ? "This process typically takes 10-30 seconds."
                : "This will complete in a few seconds."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
