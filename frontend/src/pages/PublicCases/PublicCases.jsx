import { useState, useEffect } from "react"
import { caseAPI } from "@/services/api"
import CaseCard from "@/components/Case/CaseCard"
import { Search, Sparkles, TrendingUp, Filter, SortAsc, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkeletonDashboard } from "@/components/ui/skeleton"
import { EmptyState, EmptySearchState } from "@/components/ui/empty-state"
import { useDebounce } from "@/hooks/useDebounce"
import { SearchInput } from "@/components/ui/search-input"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import WaveGridBackground from "@/components/ui/WaveGridBackground"

const CASE_TYPES = ["All", "Criminal Law", "Civil Law", "Corporate Law", "Family Law", "IP Law", "Contract Law"]
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
]

export default function PublicCases() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [allCases, setAllCases] = useState([])
  const [featuredCases, setFeaturedCases] = useState([])
  const [filteredCases, setFilteredCases] = useState([])
  const [selectedType, setSelectedType] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    loadPublicCases()
  }, [])

  const loadPublicCases = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [publicResponse, featuredResponse] = await Promise.all([
        caseAPI.getPublicCases(50),
        caseAPI.getFeaturedCases()
      ])

      const publicCases = publicResponse.data.cases || []
      const featured = featuredResponse.data.featured_cases || []

      setAllCases(publicCases)
      setFeaturedCases(featured)
      setFilteredCases(publicCases)
    } catch (err) {
      console.error("Error loading public cases:", err)
      setError(err.message || 'Failed to load public cases')
      toast.error("Failed to load public cases")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = allCases.filter((caseItem) => {
      const matchesSearch =
        caseItem.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        caseItem.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        caseItem.case_type?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

      const matchesType = selectedType === "All" || caseItem.case_type === selectedType

      return matchesSearch && matchesType
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
        case "oldest":
          return new Date(a.published_at || a.created_at) - new Date(b.published_at || b.created_at)
        case "popular":
          return (b.likes || 0) + (b.comments || 0) - ((a.likes || 0) + (a.comments || 0))
        default:
          return 0
      }
    })

    setFilteredCases(filtered)
  }, [debouncedSearchTerm, allCases, selectedType, sortBy])

  const handleCaseAction = (caseId, action) => {
    if (action === "replay") {
      navigate(`/replay/${caseId}`)
    } else if (action === "start") {
      const user = JSON.parse(localStorage.getItem("user_data") || "null")
      if (!user) {
        toast.error("Please login to simulate cases")
        navigate("/login")
        return
      }
      navigate(`/replay/${caseId}`)
    }
  }

  const transformCaseData = (caseItem) => ({
    id: caseItem.case_id,
    title: caseItem.title,
    description: caseItem.description,
    type: caseItem.case_type,
    publishedAt: caseItem.published_at || caseItem.created_at,
    user: {
      name: caseItem.published_by || "Anonymous",
      avatarUrl: null,
    },
    likeCount: caseItem.likes || 0,
    commentCount: caseItem.comments || 0,
    hasSimulation: !!caseItem.simulation_results,
    isPublic: true,
    onStart: () => handleCaseAction(caseItem.case_id, "start"),
    onReplay: () => handleCaseAction(caseItem.case_id, "replay"),
    onDownload: () => toast.info("Download feature coming soon"),
    onLikeToggle: () => {},
    onCommentClick: () => navigate(`/case/${caseItem.case_id}/discussions`),
  })

  return (
    <div className="min-h-screen relative bg-aurora">
      <WaveGridBackground />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <span>Public Cases</span>
            <Badge className="mt-2 sm:mt-0 bg-accent/20 text-accent font-medium py-1.5 px-3 rounded-xl flex items-center gap-2 shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>Community Shared</span>
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Explore and learn from cases shared by the community. Simulate and analyze real legal scenarios.
          </p>
        </div>

        {/* Featured Cases */}
        {featuredCases.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-accent" />
              <h2 className="text-2xl font-heading font-semibold">Featured Cases</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCases.slice(0, 3).map((caseItem) => (
                <div key={caseItem.case_id} className="animate-fade-in hover-lift">
                  <CaseCard caseData={transformCaseData(caseItem)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-6 mb-12">
          <div className="max-w-3xl mx-auto">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search public cases..."
              showShortcut={false}
              onClear={() => setSearchTerm("")}
            />
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
              {CASE_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={`transition-all duration-300 ${
                    selectedType === type
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                      : "glass-card border-border/50 hover:border-primary/50"
                  }`}
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="lg:hidden w-full">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full glass-card border-border/50 justify-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filter Cases ({selectedType})
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2 pr-8 glass-card border-border/50 rounded-xl bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background">
                      {option.label}
                    </option>
                  ))}
                </select>
                <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              <div className="flex glass-card rounded-xl overflow-hidden border border-border/50">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-0 px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none border-0 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="lg:hidden glass-card rounded-2xl p-6 animate-slide-up">
              <h3 className="font-semibold text-foreground mb-4">Filter by Case Type</h3>
              <div className="flex flex-wrap gap-2">
                {CASE_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center gap-3 mb-8">
          <p className="text-foreground font-medium">
            {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} found
            {selectedType !== "All" && (
              <span className="text-muted-foreground ml-1">in {selectedType}</span>
            )}
          </p>
        </div>

        {/* Cases Display */}
        {isLoading ? (
          <SkeletonDashboard />
        ) : error ? (
          <EmptyState
            icon={Search}
            title="Failed to load cases"
            description={error}
            action={<Button onClick={loadPublicCases}>Try Again</Button>}
          />
        ) : filteredCases.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
                : "space-y-6"
            }
          >
            {filteredCases.map((caseItem, index) => (
              <div
                key={caseItem.case_id}
                className={`animate-fade-in hover-lift ${viewMode === "list" ? "max-w-4xl mx-auto" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CaseCard caseData={transformCaseData(caseItem)} />
              </div>
            ))}
          </div>
        ) : (
          <EmptySearchState
            searchTerm={debouncedSearchTerm}
            onClear={debouncedSearchTerm ? () => setSearchTerm("") : null}
            onReset={() => {
              setSelectedType("All")
              setSearchTerm("")
            }}
          />
        )}
      </main>
    </div>
  )
}