import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Play, Pause, RotateCcw, MessageCircle } from "lucide-react";
import { simulationAPI } from "@/services/api";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ChatQuestionInput from "./ChatQuestionInput";
import SimulationBackground from "@/components/ui/SimulationBackground";
import FormattedTranscript from "./FormattedTranscript";

const ReplaySimulation = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showChat, setShowChat] = useState(false);
  const [chatAnswers, setChatAnswers] = useState([]);
  

  useEffect(() => {
    const fetchSimulation = async () => {
      try {
        setLoading(true);
        const response = await simulationAPI.getResults(caseId);
        setSimulation(response.data.simulation);
      } catch (err) {
        console.error("Error fetching simulation:", err);
        setError("Failed to load simulation results");
        toast.error("Failed to load simulation results");
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchSimulation();
    }
  }, [caseId]);

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
    setIsPlaying(false);
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && simulation?.turns) {
      interval = setInterval(() => {
        setCurrentTurn((prev) => {
          if (prev >= simulation.turns.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000 / playbackSpeed); // Base 3 seconds per turn
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulation, playbackSpeed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" className="text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Loading simulation...</p>
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
          <p className="text-muted-foreground">This case has not been simulated yet.</p>
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
              <h1 className="text-3xl font-bold">Simulation Replay</h1>
              <p className="text-muted-foreground">Case ID: {caseId}</p>
            </div>
          </div>
          <Button onClick={handleDownloadReport} variant="default">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
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
                  <p className="text-foreground leading-relaxed">{turn.message}</p>
                  {turn.thinking_process && (
                    <details className="mt-4">
                      <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                        Show thinking process
                      </summary>
                      <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-md">
                        {turn.thinking_process}
                      </p>
                    </details>
                  )}
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

        {/* Ask Questions Section */}
        <div className="mt-12">
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            className="w-full mb-4"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {showChat ? "Hide Questions" : "Ask Questions About This Case"}
          </Button>

          {showChat && (
            <Card>
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

                {/* Question Input */}
                <ChatQuestionInput
                  caseId={caseId}
                  onAnswer={(answer) => setChatAnswers(prev => [...prev, answer])}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplaySimulation;