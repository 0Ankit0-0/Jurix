import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Upload, User as UserIcon, Check, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { caseAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const CaseForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    case_type: "",
    plaintiff: "",
    defendant: "",
    has_evidence: false,
    evidence: null,
  });

  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.case_type) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a case.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const caseResponse = await caseAPI.create({
        title: formData.title,
        description: formData.description,
        case_type: formData.case_type,
        user_id: user.id || user._id,
        has_evidence: formData.has_evidence,
        parties: {
          plaintiff: formData.plaintiff || "Plaintiff",
          defendant: formData.defendant || "Defendant",
          judge: "AI Judge",
        },
      });

      const caseId = caseResponse.data.case_id;

      if (formData.has_evidence && formData.evidence) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", formData.evidence);
        formDataUpload.append("title", formData.evidence.name);
        formDataUpload.append("description", "Initial case evidence");

        await caseAPI.uploadEvidence(caseId, formDataUpload);
      }

      toast.success("Case created successfully! Preparing simulation...");
      navigate(`/case/${caseId}/review`);

    } catch (error) {
      console.error("Error creating case:", error);
      toast.error(`Failed to create case: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (files) => {
    if (files && files[0]) {
      const file = files[0];
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        toast.error("File too large. Max size is 20MB.");
        return;
      }
      setFormData({ ...formData, evidence: file });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  };


  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 gradient-aurora"></div>
      <div className="absolute inset-0 gradient-mesh opacity-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="glass-card border-2 border-border/30 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Scale className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold font-heading">Submit New Case</CardTitle>
            <CardDescription className="text-base">
              Provide details about your legal case for simulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">Case Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., State vs. John Doe"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold">Case Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the case details, circumstances, and relevant information..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_type" className="font-semibold">Case Type *</Label>
                <Select
                  value={formData.case_type}
                  onValueChange={(value) => setFormData({ ...formData, case_type: value })}
                >
                  <SelectTrigger id="case_type" className="h-11">
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Criminal">Criminal</SelectItem>
                    <SelectItem value="Civil">Civil</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="IP">IP</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plaintiff">Plaintiff</Label>
                   <div className="relative">
                     <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input id="plaintiff" placeholder="Plaintiff name" value={formData.plaintiff} onChange={(e) => setFormData({ ...formData, plaintiff: e.target.value })} className="pl-10"/>
                   </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defendant">Defendant</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="defendant" placeholder="Defendant name" value={formData.defendant} onChange={(e) => setFormData({ ...formData, defendant: e.target.value })} className="pl-10"/>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="has_evidence" checked={formData.has_evidence} onChange={(e) => setFormData({ ...formData, has_evidence: e.target.checked, evidence: null })} className="h-4 w-4 rounded border-border text-primary focus:ring-primary"/>
                  <Label htmlFor="has_evidence" className="font-semibold cursor-pointer">
                    Upload Evidence
                  </Label>
                </div>

                {formData.has_evidence && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                          dragActive ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50"
                      }`}
                      onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    >
                      <input type="file" id="evidence" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"/>
                      <label htmlFor="evidence" className="flex flex-col items-center space-y-2 cursor-pointer">
                        <div className={`p-3 rounded-full transition-colors ${dragActive ? 'bg-primary/20' : 'bg-muted'}`}>
                           <Upload className={`w-8 h-8 transition-colors ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formData.evidence ? formData.evidence.name : "Click to upload or drag & drop"}
                        </span>
                        <span className="text-xs text-muted-foreground">PDF, DOCX, JPG, TXT (Max 20MB)</span>
                      </label>
                      {formData.evidence && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-success font-medium">
                            <Check className="h-4 w-4" /> File selected
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
                disabled={loading}
              >
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating Case...</> : "Submit & Start Simulation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CaseForm;

