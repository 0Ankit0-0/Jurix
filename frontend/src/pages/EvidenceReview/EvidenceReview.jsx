import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { caseAPI } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EvidenceReview = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        const response = await caseAPI.getById(caseId);
        setCaseData(response.data.case);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching case data:', error);
        setError('Failed to load case data.');
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="outline">
            <Link to={`/simulation/start/${caseId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Simulation
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Evidence Review for {caseData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {caseData.evidence_files && caseData.evidence_files.length > 0 ? (
              <div className="space-y-4">
                {caseData.evidence_files.map((evidence, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{evidence.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{evidence.description}</p>
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Parsed Text:</h4>
                        <p className="text-sm whitespace-pre-wrap">{evidence.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No evidence to review for this case.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EvidenceReview;
