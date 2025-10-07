import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { caseAPI } from "@/services/api";

const CaseForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    case_type: "",
    plaintiff: "",
    defendant: "",
    judge: "AI Judge",
    has_evidence: false,
    evidence: null,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.case_type) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Create case
      const caseResponse = await caseAPI.create({
        title: formData.title,
        description: formData.description,
        case_type: formData.case_type,
        user_id: JSON.parse(localStorage.getItem("user_data"))._id,
        has_evidence: formData.has_evidence,
        parties: {
          plaintiff: formData.plaintiff,
          defendant: formData.defendant,
          judge: formData.judge,
        },
      });

      const caseId = caseResponse.data.case_id;

      // If evidence, upload it
      if (formData.has_evidence && formData.evidence) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", formData.evidence);
        formDataUpload.append("title", formData.evidence.name);
        formDataUpload.append("description", "Case evidence");

        await caseAPI.uploadEvidence(caseId, formDataUpload);
      }

      // Navigate to processing
      navigate(`/case/${caseId}/process`);

    } catch (error) {
      console.error("Error creating case:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      toast.error(`Failed to create case: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        toast.error("File too large. Please upload evidence smaller than 20MB.");
        return;
      }
      setFormData({ ...formData, evidence: file });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-medium animate-fade-in">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Submit New Case</CardTitle>
          <CardDescription className="text-base">
            Provide details about your legal case for simulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Case Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                placeholder="Enter case title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="h-11"
              />
            </div>

            {/* Case Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Case Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the case details, circumstances, and relevant information..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Case Type */}
            <div className="space-y-2">
              <Label htmlFor="case_type">Case Type *</Label>
              <Select
                value={formData.case_type}
                onValueChange={(value) => setFormData({ ...formData, case_type: value })}
                required
              >
                <SelectTrigger id="case_type" className="h-11">
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plaintiff">Plaintiff</Label>
                <Input
                  id="plaintiff"
                  placeholder="Plaintiff name"
                  value={formData.plaintiff}
                  onChange={(e) => setFormData({ ...formData, plaintiff: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defendant">Defendant</Label>
                <Input
                  id="defendant"
                  placeholder="Defendant name"
                  value={formData.defendant}
                  onChange={(e) => setFormData({ ...formData, defendant: e.target.value })}
                />
              </div>
            </div>

            {/* Evidence Upload */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_evidence"
                  checked={formData.has_evidence}
                  onChange={(e) => setFormData({ ...formData, has_evidence: e.target.checked })}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <Label htmlFor="has_evidence" className="cursor-pointer">
                  I have evidence to upload
                </Label>
              </div>

              {formData.has_evidence && (
                <div
                  className="space-y-2 animate-slide-in border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer"
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files[0]) handleFileChange({ target: { files: [e.dataTransfer.files[0]] } });
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    type="file"
                    id="evidence"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="evidence"
                    className="flex flex-col items-center space-y-2 cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formData.evidence ? formData.evidence.name : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, JPG, PNG (max 20MB)
                    </span>
                  </label>

                  {/* Optional Image Preview */}
                  {formData.evidence && formData.evidence.type.startsWith("image/") && (
                    <img
                      src={URL.createObjectURL(formData.evidence)}
                      alt="Evidence Preview"
                      className="mt-2 w-24 h-24 object-cover rounded"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading || !formData.title || !formData.description || !formData.case_type}
            >
              {loading ? "Creating Case..." : "Submit Case"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseForm;
