import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Play, Pause, RotateCcw, MessageCircle, Loader2 } from "lucide-react";
import { simulationAPI, socket } from "@/services/api";
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
  const [thinkingText, setThinkingText] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [turns, setTurns] = useState([]);
  const [evidenceProgress, setEvidenceProgress] = useState({});
  const [simulationProgress, setSimulationProgress] = useState({});

  useEffect(() => {
    // Check for invalid caseId
    if (!caseId || caseId === "undefined") {
      toast.error("Invalid case ID. Redirecting to dashboard.");
      navigate("/dashboard");
      return;
    }

    // Join socket room
    socket.emit('join', caseId);

    // Socket listeners
    socket.on('evidence_progress', (data) => {
      setEvidenceProgress(data);
      setProgress(data.progress);
    });

    socket.on('simulation_progress', (data) => {
      setSimulationProgress(data);
      setProgress(data.progress);
      setCurrentStep(data.step || currentStep);
    });

    socket.on('turn', (turn) => {
      setTurns(prev => [...prev, turn]);
      setIsTyping(false);
    });

    socket.on('thinking', (data) => {
      setIsTyping(true);
      setTypingRole(data.role);
      setThinkingText(data.message || "Thinking...");
    });

    socket.on('complete', async (data) => {
      setIsSimulating(false);
      // Fetch results
      try {
        const response = await simulationAPI.getResults(caseId);
        setSimulation(response.data.simulation);
        setLoading(false);
      } catch (err) {
        setError("Failed to load simulation");
        setLoading(false);
      }
    });

    socket.on('error', (data) => {
      setError(data.message);
      setLoading(false);
    });

    // Check initial status
    const checkInitialStatus = async () => {
      try {
        const statusResponse = await simulationAPI.getStatus(caseId);
        const statusData = statusResponse.data;

        if (statusData.completed) {
          setIsSimulating(false);
          const response = await simulationAPI.getResults(caseId);
          setSimulation(response.data.simulation);
          setLoading(false);
        } else {
          setIsSimulating(true);
          setLoading(false); // Show live view
        }
      } catch (err) {
        console.error("Error checking initial status:", err);
        setError("Failed to load simulation");
        setLoading(false);
      }
    };

    checkInitialStatus();

    return () => {
      socket.off('evidence_progress');
      socket.off('simulation_progress');
      socket.off('turn');
      socket.off('thinking');
      socket.off('complete');
      socket.off('error');
    };
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

  if (loading || (isSimulating && turns.length === 0)) {
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

  const { simulation_text } = simulation;

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
                  {/* Chat answers are displayed above */}
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
          {/* Show typing indicator when simulation is running or during replay */}
          {(isSimulating || (isTyping && currentTurn < turns.length - 1)) && (
            <TypingIndicator role={typingRole} thinkingText={thinkingText} />
          )}
          
          {/* Display turns that have been received */}
          {turns.slice(0, isSimulating ? turns.length : currentTurn + 1).map((turn, index) => (
            <motion.div
              key={`${turn.turn_number}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={`border-2 ${
                isSimulating && index === turns.length - 1 
                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                  : !isSimulating && index === currentTurn 
                  ? 'border-primary shadow-lg' 
                  : 'border-border'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant={turn.role === 'Judge' ? 'default' : turn.role === 'Prosecutor' ? 'destructive' : 'secondary'}>
                        {turn.role}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Turn {turn.turn_number + 1}</span>
                      {isSimulating && index === turns.length - 1 && (
                        <Badge variant="outline" className="ml-2 animate-pulse">
                          Live
                        </Badge>
                      )}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">{turn.timestamp}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Thinking Process Section - Enhanced */}
                  {turn.thinking_process && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent dark:via-blue-700"></div>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Thinking Process
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent dark:via-blue-700"></div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
                        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed italic">
                          "{turn.thinking_process}"
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Statement Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700"></div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Statement
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700"></div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                      <p className="text-foreground leading-relaxed">{turn.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Full Transcript - Only show when simulation is complete */}
        {!isSimulating && simulation_text && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Full Transcript</h2>
            <FormattedTranscript transcript={simulation_text} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSimulation;