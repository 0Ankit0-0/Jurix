import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { caseAPI } from "@/services/api";
import CaseCard from "@/components/Case/CaseCard";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Plus, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";

export default function MyCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchMyCases();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = cases.filter((caseItem) =>
        caseItem.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        caseItem.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        caseItem.type.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredCases(filtered);
    } else {
      setFilteredCases(cases);
    }
  }, [debouncedSearchTerm, cases]);

  const fetchMyCases = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user_data") || "{}");
      const userId = user._id;
      
      if (!userId) {
        toast.error("Please log in to view your cases");
        navigate("/login");
        return;
      }

      const response = await caseAPI.getMyCases(userId);
      const transformedData = response.data.map((caseItem) => ({
        ...caseItem,
        publishedAt: caseItem.created_at,
        user: {
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        likeCount: caseItem.likes || 0,
        commentCount: caseItem.comments || 0,
        onStart: () => navigate(`/simulation/${caseItem._id}`),
        onReplay: () => navigate(`/case/${caseItem._id}`),
        onDownload: () => toast.success("Download feature coming soon!"),
        onLikeToggle: () => {},
        onCommentClick: () => navigate(`/case/${caseItem._id}`),
      }));
      setCases(transformedData);
      setFilteredCases(transformedData);
    } catch (error) {
      console.error("Error fetching my cases:", error);
      toast.error("Failed to load your cases");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
              My Cases
            </h1>
            <p className="text-muted-foreground">
              Manage and track your legal case simulations
            </p>
          </div>
          <Button onClick={() => navigate("/case/create")} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create New Case
          </Button>
        </div>

        {/* Search */}
        <div className="max-w-3xl mx-auto mb-8">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search your cases..."
            showShortcut={true}
            onClear={() => setSearchTerm("")}
          />
        </div>

        {/* Results Summary */}
        {!loading && (
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-5 w-5 text-accent" />
            <p className="text-foreground font-medium">
              {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Cases Display */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="xl" />
          </div>
        ) : filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredCases.map((caseItem, index) => (
              <div
                key={caseItem._id}
                className="animate-fade-in hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CaseCard caseData={caseItem} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title={searchTerm ? "No cases found" : "No cases yet"}
            description={
              searchTerm
                ? "Try adjusting your search terms"
                : "Create your first case to get started!"
            }
            action={
              !searchTerm ? (
                <Button onClick={() => navigate("/case/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Case
                </Button>
              ) : (
                <Button onClick={() => setSearchTerm("")}>Clear search</Button>
              )
            }
          />
        )}
      </main>
    </div>
  );
}