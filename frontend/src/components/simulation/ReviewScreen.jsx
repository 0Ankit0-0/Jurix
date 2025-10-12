import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { caseAPI, simulationAPI, socket } from "@/services/api";
import toast from "react-hot-toast";
import { ArrowLeft, Play, Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import WaveGridBackground from "@/components/ui/WaveGridBackground";
import { Progress } from "@/components/ui/progress";

export default function ReviewScreen() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchCase() {
      try {
        setLoading(true);
        const response = await caseAPI.getById(caseId);
        setCaseData(response.data.case);
      } catch (error) {
        toast.error("Failed to load case data for review.");
        console.error("Error loading case data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [caseId]);

  // Socket listeners for progress during simulation start
  useEffect(() => {
    if (simulating && caseId) {
      socket.emit('join', caseId);

      const handleEvidenceProgress = (data) => {
        setProgress(data.progress);
      };

      const handleSimulationProgress = (data) => {
        setProgress(data.progress);
      };

      const handleComplete = () => {
        setProgress(100);
        setTimeout(() => {
          navigate(`/simulation/${caseId}`);
        }, 500);
      };

      const handleError = (data) => {
        toast.error(data.message);
        setSimulating(false);
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
  }, [simulating, caseId, navigate]);

  const handleStartSimulation = async () => {
    try {
      setSimulating(true);
      toast.loading("Starting courtroom simulation...", { id: 'sim' });
      await simulationAPI.start(caseId);
      toast.success("Simulation started! Redirecting...", { id: 'sim' });
      navigate(`/simulation/start/${caseId}`);
    } catch (error) {
      toast.error("Failed to start simulation.", { id: 'sim' });
      console.error("Error starting simulation:", error);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Loading case data for review...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Could not load case data.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      <WaveGridBackground />
      <Card className="w-full max-w-3xl shadow-2xl glass-card border-border/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-heading font-bold">Review Your Case</CardTitle>
          <CardDescription className="text-base">Confirm the details below before starting the AI simulation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="font-semibold">Case Title</Label>
            <p className="text-lg p-3 bg-muted/50 rounded-md border">{caseData.title}</p>
          </div>
          <div>
            <Label className="font-semibold">Case Type</Label>
            <p><Badge>{caseData.case_type}</Badge></p>
          </div>
          <div>
            <Label className="font-semibold">Case Description</Label>
            <p className="text-sm p-3 bg-muted/50 rounded-md border max-h-48 overflow-y-auto">{caseData.description}</p>
          </div>

          {caseData.has_evidence && caseData.evidence_analysis && caseData.evidence_analysis.length > 0 && (
            <div>
              <Label className="font-semibold">Evidence Summary ({caseData.evidence_analysis.length})</Label>
              <div className="space-y-2 mt-2 border rounded-md p-3 max-h-60 overflow-y-auto">
                {caseData.evidence_analysis.map((evidence, index) => (
                  <div key={evidence.evidence_id || index} className="p-2 bg-muted/50 rounded text-sm">
                    <p className="font-bold flex items-center gap-2"><FileText className="h-4 w-4" /> {evidence.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{evidence.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-6 bg-muted/30 border-t">
          {simulating && <Progress value={progress} className="w-full" />}
          <div className="flex justify-between gap-4 w-full">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={simulating}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              onClick={handleStartSimulation}
              disabled={simulating}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl"
            >
              {simulating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Simulating...</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Confirm & Run Simulation</>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

const Label = ({ children, className }) => (
  <label className={`block text-sm font-medium text-muted-foreground mb-1 ${className}`}>{children}</label>
)

