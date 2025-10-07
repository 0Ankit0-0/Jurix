import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { caseAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { EmptyState, EmptySearchState } from "@/components/ui/empty-state";
import { CaseCard } from "@/components/Case/CaseCard";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import {
  FileText,
  User,
  Globe,
  Filter,
  Grid,
  List,
  SortAsc,
  TrendingUp,
  Sparkles,
  Search
} from "lucide-react";

const fetchMockCases = () => {
  return fetch("/mockCases.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch cases")
      return response.json()
    })
    .catch((error) => {
      console.error("Error fetching mock cases:", error)
      return []
    })
}

const CASE_TYPES = ["All", "Criminal Law", "Civil Law", "Corporate Law", "Family Law", "IP Law", "Contract Law"]
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
  { value: "difficulty", label: "Difficulty" }
]

export default function Dashboard({ userName }) {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // State management
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("my-cases");
  const [myCases, setMyCases] = useState([]);
  const [publicCases, setPublicCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);

  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);


  // Keyboard shortcuts
  useKeyboardShortcut(['ctrl', 'k'], (e) => {
    e.preventDefault()
    document.querySelector('input[type="text"]')?.focus()
  })

  useKeyboardShortcut(['ctrl', 'shift', 'g'], () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid')
  })

  useKeyboardShortcut(['ctrl', 'shift', 'f'], () => {
    setShowFilters(!showFilters)
  })

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    loadMyCases();
  }, [isLoggedIn, user]);

  const loadMyCases = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Use correct method name and normalize user ID
      const userId = user._id || user.id;
      const [myCasesResponse, publicCasesResponse] = await Promise.all([
        caseAPI.getMyCases(userId),
        caseAPI.getPublicCases()
      ]);
      
      setMyCases(myCasesResponse.data.cases || []);
      setPublicCases(publicCasesResponse.data.cases || []);
      
    } catch (error) {
      console.error("Error loading cases:", error);
      setError(error.message || "Failed to load cases");
      toast.error("Failed to load cases");
      setMyCases([]);
      setPublicCases([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteCase = async (caseId) => {
    if (!window.confirm("Are you sure you want to delete this case?")) {
      return;
    }

    try {
      await caseAPI.delete(caseId);
      toast.success("Case deleted successfully");
      loadMyCases(); // Reload cases
    } catch (error) {
      console.error("Error deleting case:", error);
      toast.error("Failed to delete case");
    }
  };

  const handleTogglePublic = async (caseId, currentStatus) => {
    try {
      // Use case_id (not MongoDB _id) for the API call
      const userId = (user?._id?.$oid || user?._id || user?.id || user?.user_id);

      if (!userId) {
        toast.error("User not authenticated");
        return;
      }
      
      if (currentStatus) {
        await caseAPI.unpublish(caseId, userId);
        toast.success("Case is now private");
      } else {
        await caseAPI.publish(caseId, userId);
        toast.success("Case published successfully");
      }
      
      // Reload both my cases and public cases
      await loadMyCases();
    } catch (error) {
      console.error("Error toggling case privacy:", error);
      toast.error("Failed to update case privacy");
    }
  };

  useEffect(() => {
    const casesToFilter = activeTab === "my-cases" ? myCases : publicCases
    
    let filtered = casesToFilter.filter((caseItem) => {
      const matchesSearch =
        caseItem.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        caseItem.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        caseItem.type?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

      const matchesType = selectedType === "All" || caseItem.type === selectedType

      return matchesSearch && matchesType
    })

    // Sort cases
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at)
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at)
        case "popular":
          return (b.likes + b.comments) - (a.likes + a.comments)
        case "difficulty":
          return (b.difficulty || 0) - (a.difficulty || 0)
        default:
          return 0
      }
    })

    setFilteredCases(filtered)
  }, [debouncedSearchTerm, myCases, publicCases, selectedType, sortBy, activeTab])

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  const handleResetFilters = () => {
    setSelectedType("All")
    setSearchTerm("")
    setSortBy("newest")
  }

  const handleLikeToggle = async (caseId, isLiked) => {
    try {
      if (isLiked) {
        await caseAPI.like(caseId, user._id || user.id);
        toast.success("Added to favorites");
      } else {
        await caseAPI.unlike(caseId, user._id || user.id);
        toast.success("Removed from favorites");
      }
      loadMyCases(); // Refresh cases
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update favorite status");
    }
  }

  const handleCommentClick = (caseId) => {
    navigate(`/case/${caseId}/discussions`);
  }

  const handleStartSimulation = async (caseId) => {
    try {
      const actualId = typeof caseId === 'object' && caseId.$oid ? caseId.$oid : caseId;
      
      // First get the case details to check if it has simulation results
      const response = await caseAPI.getById(actualId);
      const caseData = response.data;

      // If the case already has simulation results, redirect to replay
      if (caseData.simulation_results) {
        navigate(`/simulation/replay/${caseData.case_id}`);
        return;
      }

      // Otherwise start a new simulation
      if (activeTab === "public-cases") {
        await caseAPI.simulatePublicCase(actualId);
      }
      navigate(`/simulation/start/${caseData.case_id}`);
    } catch (error) {
      console.error("Error starting simulation:", error);
      toast.error("Failed to start simulation");
    }
  }

  const handleReplaySimulation = async (caseId) => {
    try {
      const actualId = typeof caseId === 'object' && caseId.$oid ? caseId.$oid : caseId;
      
      // First check if the case has simulation results
      const response = await caseAPI.getById(actualId);
      const caseData = response.data;

      if (!caseData.simulation_results) {
        toast.error("No simulation results available for replay");
        return;
      }

      navigate(`/simulation/replay/${caseData.case_id}`);
    } catch (error) {
      console.error("Error replaying simulation:", error);
      toast.error("Failed to replay simulation");
    }
  }

  const handleDownload = async (caseId) => {
    try {
      const actualId = typeof caseId === 'object' && caseId.$oid ? caseId.$oid : caseId;
      
      // Get the case data including simulation results
      const response = await caseAPI.getById(actualId);
      const caseData = response.data;
      
      // Check if the case has simulation results
      if (!caseData.simulation_results) {
        toast.error("No simulation results available for download");
        return;
      }
      
      // Use simulationAPI to get the report
      const reportResponse = await simulationAPI.getReport(actualId);
      
      // Create a blob from the response
      const blob = new Blob([reportResponse.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a hidden link element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `case-${caseData.case_id}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Case report downloaded successfully");
    } catch (error) {
      console.error("Error downloading case:", error);
      toast.error("Failed to download case report");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Enhanced Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-foreground flex flex-col sm:flex-row sm:items-center sm:gap-5 mb-4">
            <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Welcome back, {userName}!</span>
            <Badge className="mt-3 sm:mt-0 bg-gradient-to-r from-accent/20 to-accent/10 text-accent font-bold py-2 px-4 rounded-xl flex items-center gap-2.5 shadow-lg border-2 border-accent/30 hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5 fill-accent/30" />
              <span>Manage your legal cases</span>
            </Badge>
          </h1>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 glass-card p-1.5 shadow-xl border-2 border-border/50">
            <TabsTrigger value="my-cases" className="gap-2.5 py-3 rounded-lg font-semibold data-[state=active]:shadow-lg transition-all duration-300">
              <User className="h-5 w-5" />
              My Cases
            </TabsTrigger>
            <TabsTrigger value="public-cases" className="gap-2.5 py-3 rounded-lg font-semibold data-[state=active]:shadow-lg transition-all duration-300">
              <Globe className="h-5 w-5" />
              Public Cases
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Modern Search and Filters */}
        <div className="space-y-6 mb-12">
          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search cases by title, description, or type..."
                showShortcut={true}
                onClear={handleClearSearch}
                className="shadow-xl"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
              {CASE_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={`transition-all duration-300 hover-lift ${selectedType === type
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                      : "glass-card border-border/50 hover:border-primary/50"
                    }`}
                >
                  {type}
                </Button>
              ))}
            </div>

            {/* Mobile Filter Toggle */}
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

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Enhanced Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-5 py-2.5 pr-10 glass-card border-2 border-border/50 rounded-xl bg-transparent text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background">
                      {option.label}
                    </option>
                  ))}
                </select>
                <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Enhanced View Mode Toggle */}
              <div className="flex glass-card rounded-xl overflow-hidden border-2 border-border/50 shadow-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-0 px-4 py-2.5 transition-all duration-300"
                >
                  <Grid className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none border-0 px-4 py-2.5 transition-all duration-300"
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
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
                    className={`transition-all duration-300 ${selectedType === type
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                        : "border-border/50 hover:border-primary/50"
                      }`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3 glass-card px-5 py-3 rounded-xl border-2 border-border/50 shadow-lg">
            <TrendingUp className="h-6 w-6 text-accent fill-accent/20" />
            <p className="text-foreground font-bold text-lg">
              {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} found
              {selectedType !== "All" && (
                <span className="text-muted-foreground ml-2 font-semibold">in {selectedType}</span>
              )}
            </p>
          </div>
          {debouncedSearchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear search
            </Button>
          )}
        </div>

        {/* Cases Display */}
        {isLoading ? (
          <SkeletonDashboard />
        ) : error ? (
          <EmptyState
            icon={FileText}
            title="Failed to load cases"
            description={error}
            action={
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            }
          />
        ) : filteredCases.length > 0 ? (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
              : "space-y-6"
          }>
            {filteredCases.map((caseItem, index) => {
              // Ensure we have valid case data
              const caseId = caseItem._id || caseItem.id;
              // Extract MongoDB _id and convert case_id to ID if needed
              const actualId = caseItem._id.$oid || caseItem._id || caseId;
              
              const formattedCase = {
                ...caseItem,
                id: actualId,
                _id: actualId, // Keep MongoDB ID format
                case_id: caseItem.case_id, // Keep original case_id
                publishedAt: caseItem.publishedAt || caseItem.created_at || new Date().toISOString(),
                user: {
                  name: caseItem.user?.name || (() => {
                    try {
                      const userData = JSON.parse(localStorage.getItem("user_data") || "null");
                      return userData?.name || "Guest User";
                    } catch {
                      return "Guest User";
                    }
                  })(),
                  avatarUrl: caseItem.user?.avatarUrl,
                  id: caseItem.user?._id?.$oid || caseItem.user?._id || caseItem.user?.id || caseItem.user_id
                },
                title: caseItem.title || "Untitled Case",
                description: caseItem.description || "No description available",
                type: caseItem.case_type || caseItem.type || "Other",
                // Handle both isPublic and is_public fields
                isPublic: Boolean(caseItem.isPublic || caseItem.is_public),
                likeCount: caseItem.likeCount || caseItem.like_count || 0,
                commentCount: caseItem.commentCount || caseItem.comment_count || 0,
                // Check if the case has simulation results
                hasSimulation: Boolean(caseItem.simulation_results),
                // Add handlers for card actions
                onLikeToggle: (isLiked) => handleLikeToggle(caseItem.case_id, isLiked),
                onCommentClick: () => handleCommentClick(caseItem.case_id),
                onStart: () => handleStartSimulation(caseItem.case_id),
                onReplay: () => handleReplaySimulation(caseItem.case_id),
                onDownload: () => handleDownload(caseItem.case_id),
                onTogglePublic: () => handleTogglePublic(caseItem.case_id, Boolean(caseItem.isPublic || caseItem.is_public))
              };

              return (
                <div
                  key={formattedCase.id}
                  className={`animate-fade-in hover-lift ${viewMode === "list" ? "max-w-4xl mx-auto" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CaseCard 
                    caseData={formattedCase} 
                    showPublicToggle={activeTab === "my-cases"}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          (debouncedSearchTerm || selectedType !== "All") ? (
            <EmptySearchState
              searchTerm={debouncedSearchTerm}
              onClear={debouncedSearchTerm ? handleClearSearch : null}
              onReset={handleResetFilters}
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="No cases available"
              description="No cases available at the moment. Check back soon for new legal scenarios!"
            />
          )
        )}
      </main>
    </div>
  )
}