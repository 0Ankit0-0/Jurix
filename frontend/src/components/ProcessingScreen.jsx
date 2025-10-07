
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ProcessingScreen = ({ caseId, evidence = [] }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef();
  const startTimeRef = useRef();

  const hasEvidence = evidence && evidence.length > 0;
  
  // Define steps based on whether evidence exists
  const steps = hasEvidence 
    ? [
        { name: 'Upload', duration: 2000 },
        { name: 'Parse', duration: 8000 },
        { name: 'Summarize', duration: 6000 },
        { name: 'Review', duration: 1000 }
      ]
    : [
        { name: 'Setup', duration: 1500 },
        { name: 'Review', duration: 1000 }
      ];

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
      
      setProgress(progressPercent);
      
      // Update current step based on elapsed time
      let accumulatedTime = 0;
      let newCurrentStep = 0;
      
      for (let i = 0; i < steps.length; i++) {
        accumulatedTime += steps[i].duration;
        if (elapsed < accumulatedTime) {
          newCurrentStep = i;
          break;
        }
        newCurrentStep = i + 1;
      }
      
      setCurrentStep(newCurrentStep);
      
      if (progressPercent < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsComplete(true);
        // Navigate to simulation after completion
        setTimeout(() => {
          navigate(`/simulation/${caseId}`);
        }, 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [caseId, navigate, totalDuration, steps]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Processing Case
          </h2>
          <p className="text-gray-600">
            {hasEvidence 
              ? 'Analyzing evidence and preparing simulation...' 
              : 'Setting up simulation environment...'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className={`font-medium ${
                index <= currentStep ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
              {index === currentStep && !isComplete && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="mt-6 text-center">
            <div className="text-green-600 font-medium">Complete!</div>
            <div className="text-sm text-gray-600">Redirecting to simulation...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingScreen;
