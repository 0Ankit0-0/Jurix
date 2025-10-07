import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { caseAPI } from "@/services/api"
import { DiscussionThread } from "@/components/Discussion/DiscussionThread"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Calendar, User } from "lucide-react"
import { toast } from "react-hot-toast"

export default function CaseDiscussions() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCaseData()
  }, [caseId])

  const loadCaseData = async () => {
    try {
      setIsLoading(true)
      const response = await caseAPI.getById(caseId)
      setCaseData(response.data.case)
    } catch (error) {
      console.error("Error loading case:", error)
      toast.error("Failed to load case details")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading case...</p>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Case Not Found</h2>
          <p className="text-muted-foreground mb-6">The case you're looking for doesn't exist or is private.</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Case Header */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
                {caseData.title}
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {caseData.description}
              </p>
            </div>
            <Badge className="self-start">{caseData.case_type}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(caseData.created_at).toLocaleDateString()}
              </span>
            </div>
            {caseData.published_by && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{caseData.published_by}</span>
              </div>
            )}
          </div>
        </div>

        {/* Discussion Thread */}
        <DiscussionThread caseId={caseId} />
      </div>
    </div>
  )
}