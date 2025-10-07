import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, Brain, CircleCheck } from "lucide-react";
import { simulationAPI } from "@/services/api";

/** Get icon for processing step */
function getStepIcon(index) {
  const icons = [FileText, Search, Brain, CircleCheck];
  return icons[index] || FileText;
}

/** Processing Step Item */
function ProcessingStepItem({ step, index }) {
  const Icon = getStepIcon(index);

  const stepClasses = step.active
    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
    : step.completed
    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";

  const iconClasses = step.active
    ? "bg-blue-600 text-white"
    : step.completed
    ? "bg-green-600 text-white"
    : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400";

  const textClasses = step.active
    ? "text-blue-700 dark:text-blue-300"
    : step.completed
    ? "text-green-700 dark:text-green-300"
    : "text-gray-500 dark:text-gray-400";

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${stepClasses}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${iconClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className={`font-medium text-sm ${textClasses}`}>{step.label}</p>
        {step.active && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Processing...</p>}
      </div>
      {step.completed && (
        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

/** Processing Screen Component */
export default function ProcessingScreen() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasEvidence, setHasEvidence] = useState(true);
  const pollingIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const steps = hasEvidence
    ? [
        { label: "Uploading Evidence", active: currentStep === 0, completed: currentStep > 0 },
        { label: "Parsing Documents", active: currentStep === 1, completed: currentStep > 1 },
        { label: "Analyzing Case", active: currentStep === 2, completed: currentStep > 2 },
        { label: "Finalizing", active: currentStep === 3, completed: currentStep > 3 },
      ]
    : [
        { label: "Preparing Case", active: currentStep === 0, completed: currentStep > 0 },
        { label: "Finalizing", active: currentStep === 1, completed: currentStep > 1 },
      ];

  // Smooth progress animation using requestAnimationFrame
  const animateProgress = (targetProgress) => {
    const animate = () => {
      setProgress((prev) => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.5) {
          return targetProgress;
        }
        return prev + diff * 0.1; // Smooth easing
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
        
        // Check if case has evidence
        if (statusData.has_evidence !== undefined) {
          setHasEvidence(statusData.has_evidence);
        }

        // Check if simulation is completed
        if (statusData.completed) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          animateProgress(100);
          setCurrentStep(statusData.has_evidence ? 4 : 2);
          setTimeout(() => {
            if (isActive) {
              navigate(`/case/${caseId}/review`);
            }
          }, 800);
          return;
        }

        // Update progress based on backend or time elapsed
        if (statusData.progress !== undefined && statusData.progress > 0) {
          animateProgress(statusData.progress);
        } else {
          // Calculate progress based on time elapsed
          const elapsed = Date.now() - startTimeRef.current;
          const maxTime = statusData.has_evidence ? 25000 : 2000; // 25s with evidence, 2s without
          const calculatedProgress = Math.min(95, (elapsed / maxTime) * 100);
          animateProgress(calculatedProgress);
        }

        if (statusData.step !== undefined && statusData.step > 0) {
          setCurrentStep(statusData.step);
        } else {
          // Auto-advance steps based on progress
          const currentProgress = Math.round(progress);
          const stepThresholds = statusData.has_evidence ? [25, 50, 75, 95] : [50, 95];
          const newStep = stepThresholds.findIndex(threshold => currentProgress < threshold);
          if (newStep !== -1 && newStep !== currentStep) {
            setCurrentStep(newStep);
          } else if (currentProgress >= 95) {
            setCurrentStep(statusData.has_evidence ? 3 : 1);
          }
        }
      } catch (error) {
        console.error("Error polling simulation status:", error);
        // Continue with time-based progress on error
        const elapsed = Date.now() - startTimeRef.current;
        const maxTime = hasEvidence ? 25000 : 2000;
        const calculatedProgress = Math.min(95, (elapsed / maxTime) * 100);
        animateProgress(calculatedProgress);
      }
    }

    // Initial poll
    pollStatus();
    
    // Poll every 1.5 seconds for faster updates
    pollingIntervalRef.current = setInterval(pollStatus, 1500);

    return () => {
      isActive = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [caseId, navigate, hasEvidence, progress, currentStep]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-md border border-gray-200 dark:border-gray-800 rounded-2xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-3xl font-heading font-bold text-gray-800 dark:text-gray-100">
            Processing Your Case
          </CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-400">
            {hasEvidence 
              ? "Our AI is analyzing your case details and evidence..."
              : "Preparing your case for simulation..."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Processing Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <ProcessingStepItem key={index} step={step} index={index} />
            ))}
          </div>

          {/* Estimated Time */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasEvidence 
                ? "This process typically takes 10-30 seconds"
                : "This will complete in less than 3 seconds"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}