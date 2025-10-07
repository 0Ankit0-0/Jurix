import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { caseAPI } from "@/services/api";
import toast from "react-hot-toast";

export default function ReviewScreen() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [caseData, setCaseData] = useState({
    title: "",
    description: "",
    case_type: "",
  });
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    async function fetchCase() {
      try {
        setLoading(true);
        const response = await caseAPI.get(caseId);
        const data = response.data;
        setCaseData({
          title: data.title || "",
          description: data.description || "",
          case_type: data.case_type || "",
        });
        setOriginalData({
          title: data.title || "",
          description: data.description || "",
          case_type: data.case_type || "",
        });
      } catch (error) {
        toast.error("Failed to load case data");
        console.error("Error loading case data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [caseId]);

  const handleChange = (field) => (e) => {
    setCaseData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      caseData.title !== originalData.title ||
      caseData.description !== originalData.description ||
      caseData.case_type !== originalData.case_type
    );
  };

  const handleSaveAndProcess = async () => {
    if (!hasChanges()) {
      // No changes, proceed to simulate
      navigate(`/case/${caseId}/simulate`);
      return;
    }
    try {
      setSaving(true);
      await caseAPI.update(caseId, caseData);
      toast.success("Case updated successfully");
      // After update, reprocess
      navigate(`/case/${caseId}/process`);
    } catch (error) {
      toast.error("Failed to update case");
      console.error("Error updating case:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading case data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Review Your Case Details</CardTitle>
          <CardDescription>Please review and edit your case details before simulation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="title" className="block font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              value={caseData.title}
              onChange={handleChange("title")}
              placeholder="Enter case title"
            />
          </div>
          <div>
            <label htmlFor="description" className="block font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={caseData.description}
              onChange={handleChange("description")}
              placeholder="Enter case description"
              rows={4}
            />
          </div>
          <div>
            <label htmlFor="case_type" className="block font-medium mb-1">
              Case Type
            </label>
            <Input
              id="case_type"
              value={caseData.case_type}
              onChange={handleChange("case_type")}
              placeholder="Enter case type"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Back
            </Button>
            <Button
              onClick={handleSaveAndProcess}
              disabled={saving}
            >
              {saving ? "Saving..." : hasChanges() ? "Save & Reprocess" : "Proceed to Simulation"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
