// Enhanced LiveSimulation.jsx with true real-time updates

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, MessageCircle, Scale } from "lucide-react";
import { simulationAPI, caseAPI, socket } from "@/services/api";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ChatQuestionInput from "./ChatQuestionInput";
import WaveGridBackground from "@/components/ui/WaveGridBackground";
import TypingIndicator from "./TypingIndicator";
import FormattedTranscript from "./FormattedTranscript";
import VirtualList from "@/components/ui/virtual-list";

const LiveSimulation = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  
  // State
  const [simulation, setSimulation] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [chatAnswers, setChatAnswers] = useState([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingRole, setTypingRole] = useState("Judge");
  const [thinkingText, setThinkingText] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [turns, setTurns] = useState([]);
  const [evidenceParsed, setEvidenceParsed] = useState(false);

  useEffect(() => {
    if (!caseId || caseId === "undefined") {
      toast.error("Invalid case ID. Redirecting to dashboard.");
      navigate("/dashboard");
      return;
    }

    const fetchCaseData = async () => {
      try {
        const response = await caseAPI.getById(caseId);
        setCaseData(response.data.case);
      } catch (error) {
        console.error("Error fetching case data:", error);
      }
    };

    fetchCaseData();

    socket.emit('join', caseId);

    socket.on('evidence_progress', (data) => {
      setProgress(data.progress);
      if (data.progress === 100) {
        setEvidenceParsed(true);
      }
    });

    socket.on('simulation_progress', (data) => {
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

    socket.on('complete', async () => {
      setIsSimulating(false);
      try {
        const response = await simulationAPI.getResults(caseId);
        setSimulation(response.data.simulation);
        setTurns(response.data.simulation.turns); // Set final turns from result
        setLoading(false);
      } catch (err) {
        setError("Failed to load final simulation results");
        setLoading(false);
      }
    });

    socket.on('error', (data) => {
      setError(data.message);
      setLoading(false);
    });

    const checkInitialStatus = async () => {
      try {
        const statusResponse = await simulationAPI.getStatus(caseId);
        const statusData = statusResponse.data;

        if (statusData.completed) {
          setIsSimulating(false);
          const response = await simulationAPI.getResults(caseId);
          setSimulation(response.data.simulation);
          setTurns(response.data.simulation.turns);
          setLoading(false);
        } else {
          setIsSimulating(true);
          setLoading(false);
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

  const handleDownloadReport = useCallback(async () => {
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
  }, [caseId]);

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
                <Progress value={progress} className="h-2.5" />
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

  return (
    <div className="min-h-screen relative">
      <WaveGridBackground />
      <div className="container mx-auto px-4 py-8">
        
        <div className="mb-8">
          <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Scale className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Courtroom Simulation</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-primary/10">
                      {caseData?.case_type || "Case"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs animate-pulse">
                      {isSimulating ? "● Live" : "Completed"}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
                    {caseData?.title || "Case Simulation"}
                  </CardTitle>
                  
                  <CardDescription className="text-sm md:text-base leading-relaxed">
                    {caseData?.description || `Simulating case: ${caseId}`}
                  </CardDescription>
                  
                  {caseData?.parties && (
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-semibold">Plaintiff:</span> {caseData.parties.plaintiff || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold">Defendant:</span> {caseData.parties.defendant || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold">Judge:</span> {caseData.parties.judge || "AI Judge"}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Button onClick={handleDownloadReport} variant="default" size="sm" className="shadow-lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  {evidenceParsed && (
                    <Button onClick={() => navigate(`/case/${caseId}/evidence-review`)} variant="outline" size="sm" className="shadow-lg">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Review Evidence
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground font-mono">ID: {caseId.slice(0, 8)}...</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {isSimulating && (
            <Card className="mb-4 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Simulation Progress</span>
                  <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Step {currentStep}: Processing court simulation...
                </p>
              </CardContent>
            </Card>
          )}
        </div>

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
                  Ask questions about the case, evidence, AI arguments, or legal provisions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {chatAnswers.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {chatAnswers.map((answer, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-foreground">{answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                <ChatQuestionInput
                  caseId={caseId}
                  onAnswer={(answer) => setChatAnswers(prev => [...prev, answer])}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {isTyping && (
            <TypingIndicator role={typingRole} thinkingText={thinkingText} />
          )}

          {turns.length > 20 ? (
            <VirtualList
              items={turns}
              itemHeight={200} // Approximate height per turn
              containerHeight={600}
              renderItem={(turn, index) => (
                <motion.div
                  key={`${turn.turn_number}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className={`border-2 ${
                    isSimulating && index === turns.length - 1
                      ? 'border-primary shadow-lg ring-2 ring-primary/20'
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
              )}
            />
          ) : (
            turns.map((turn, index) => (
              <motion.div
                key={`${turn.turn_number}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className={`border-2 ${
                  isSimulating && index === turns.length - 1
                    ? 'border-primary shadow-lg ring-2 ring-primary/20'
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
            ))
          )}
        </div>

        {!isSimulating && simulation?.simulation_text && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Full Transcript</h2>
            <FormattedTranscript transcript={simulation.simulation_text} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSimulation;