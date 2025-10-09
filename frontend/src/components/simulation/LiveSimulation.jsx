import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Play, Pause, RotateCcw, MessageCircle, Loader2 } from "lucide-react";
import { simulationAPI } from "@/services/api";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ChatQuestionInput from "./ChatQuestionInput";
import SimulationBackground from "@/components/ui/SimulationBackground";
import TypingIndicator from "./TypingIndicator";
import FormattedTranscript from "./FormattedTranscript";

const LiveSimulation = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play for live
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showChat, setShowChat] = useState(true);
  const [chatAnswers, setChatAnswers] = useState([]);
  const [isSimulating, setIsSimulating] = useState(true); // Check if still running
  const [isTyping, setIsTyping] = useState(false);
  const [typingRole, setTypingRole] = useState("Judge");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check for invalid caseId
    if (!caseId || caseId === "undefined") {
      toast.error("Invalid case ID. Redirecting to dashboard.");
      navigate("/dashboard");
      return;
    }

    const checkStatusAndFetch = async () => {
      try {
        // First check status
        const statusResponse = await simulationAPI.getStatus(caseId);
        const statusData = statusResponse.data;

        // Update progress from backend
        if (statusData.progress !== undefined) {
          setProgress(statusData.progress);
        }
        if (statusData.step !== undefined) {
          setCurrentStep(statusData.step);
        }

        if (statusData.completed) {
          setIsSimulating(false);
          // Fetch results
          const response = await simulationAPI.getResults(caseId);
          setSimulation(response.data.simulation);
          setLoading(false);
        } else {
          // Still simulating, wait
          setTimeout(checkStatusAndFetch, 2000);
        }
      } catch (err) {
        console.error("Error checking status:", err);
        setError("Failed to load simulation");
        setLoading(false);
      }
    };

    checkStatusAndFetch();
  }, [caseId, navigate]);

  const handleDownloadReport = async () => {
    try {
      const response = await simulationAPI.getReport(caseId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `simulation_report_${caseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTurn(0);
    setIsPlaying(true);
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && simulation?.turns && !isSimulating) {
      interval = setInterval(() => {
        setCurrentTurn((prev) => {
          if (prev >= simulation.turns.length - 1) {
            setIsPlaying(false);
            setIsTyping(false);
            return prev;
          }

          // Show typing indicator before next turn
          setIsTyping(true);
          const nextTurn = simulation.turns[prev + 1];
          if (nextTurn) {
            setTypingRole(nextTurn.role);
          }

          // Hide typing indicator and show turn after delay
          setTimeout(() => {
            setIsTyping(false);
          }, 1500 / playbackSpeed);

          return prev + 1;
        });
      }, 3000 / playbackSpeed); // Base 3 seconds per turn
    }
    return () => {
      clearInterval(interval);
      setIsTyping(false);
    };
  }, [isPlaying, simulation, playbackSpeed, isSimulating]);

  if (loading || isSimulating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <LoadingSpinner size="xl" className="text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-muted-foreground animate-pulse">
              {isSimulating ? "Running live simulation..." : "Loading simulation..."}
            </p>
            {isSimulating && (
              <div className="w-full max-w-md mx-auto">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Step {currentStep}: Processing court simulation...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Simulation not available.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { turns, simulation_text } = simulation;

  return (
    <div className="min-h-screen relative">
      <SimulationBackground />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Live Simulation</h1>
              <p className="text-muted-foreground">Case ID: {caseId}</p>
            </div>
          </div>
          <Button onClick={handleDownloadReport} variant="default">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Ask Questions Section - Moved to top */}
        <div className="mb-8">
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            className="w-full mb-4"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {showChat ? "Hide Questions" : "Ask Questions About This Case"}
          </Button>

          {showChat && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Ask Questions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ask questions about the case, evidence, AI arguments, or legal provisions. Get instant AI-powered answers.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat Answers */}
                {chatAnswers.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {chatAnswers.map((answer, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-foreground">{answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                <CardContent>
                  {turn.thinking_process && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">Thinking Process:</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                        {turn.thinking_process}
                      </p>
                    </div>
                  )}
                  <p className="text-foreground leading-relaxed">{turn.message}</p>
                </CardContent>

                {/* Question Input */}
                <ChatQuestionInput
                  caseId={caseId}
                  onAnswer={(answer) => setChatAnswers(prev => [...prev, answer])}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={handlePlayPause} variant="outline">
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSpeedChange} variant="outline">
            Speed: {playbackSpeed}x
          </Button>
          <div className="text-sm text-muted-foreground">
            Turn {currentTurn + 1} of {turns.length}
          </div>
        </div>

        {/* Turns Display */}
        <div className="space-y-4">
          {isTyping && currentTurn < turns.length - 1 && (
            <TypingIndicator role={typingRole} />
          )}
          {turns.slice(0, currentTurn + 1).map((turn, index) => (
            <motion.div
              key={turn.turn_number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`border-2 ${index === currentTurn ? 'border-primary shadow-lg' : 'border-border'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant={turn.role === 'Judge' ? 'default' : turn.role === 'Prosecutor' ? 'destructive' : 'secondary'}>
                        {turn.role}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Turn {turn.turn_number + 1}</span>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">{turn.timestamp}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {turn.thinking_process && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">Thinking Process:</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                        {turn.thinking_process}
                      </p>
                    </div>
                  )}
                  <p className="text-foreground leading-relaxed">{turn.message}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Full Transcript */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Full Transcript</h2>
          <FormattedTranscript transcript={simulation_text} />
        </div>
      </div>
    </div>
  );
};

export default LiveSimulation;