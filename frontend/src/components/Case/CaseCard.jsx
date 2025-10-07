import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Play, RotateCcw, Download, Globe, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { caseAPI, simulationAPI } from "@/services/api";
import toast from "react-hot-toast";

function formatDate(input) {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function getInitials(name) {
  if (!name || name === "Guest User") return "GU";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function getUserName() {
  try {
    const userData = JSON.parse(localStorage.getItem("user_data") || "null");
    return userData?.name || "Guest User";
  } catch {
    return "Guest User";
  }
}

export function CaseCard({ caseData, className, showPublicToggle = false }) {
  const navigate = useNavigate();
  const {
    case_id,
    title,
    description,
    case_type,
    created_at,
    user,
    likeCount = 0,
    commentCount = 0,
    initiallyLiked = false,
    is_public = false,
    simulation_results = null,
    onLikeToggle,
    onCommentClick,
    onTogglePublic,
  } = caseData;

  // Get user name with fallback
  const displayUserName = user?.name || getUserName();

  const [liked, setLiked] = useState(initiallyLiked);
  const [likes, setLikes] = useState(likeCount);
  const [loading, setLoading] = useState(false);

  const hasSimulation = !!simulation_results;

  function handleToggleLike() {
    setLiked((prev) => {
      const next = !prev;
      setLikes((c) => (next ? c + 1 : Math.max(0, c - 1)));
      onLikeToggle?.(next);
      return next;
    });
  }

  const handleStartSimulation = async () => {
    setLoading(true);
    try {
      await simulationAPI.start(case_id);
      toast.success("Simulation started!");
      navigate(`/case/${case_id}/process`);
    } catch (error) {
      console.error("Error starting simulation:", error);
      toast.error("Failed to start simulation");
    } finally {
      setLoading(false);
    }
  };

  const handleReplaySimulation = () => {
    navigate(`/simulation/${case_id}`);
  };

  const handleDownloadReport = async () => {
    try {
      const response = await simulationAPI.getReport(case_id);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `simulation_report_${case_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    }
  };

  const handlePublish = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user_data"));
      await caseAPI.publish(case_id, userData._id);
      toast.success("Case published successfully!");
      // Refresh or update state
    } catch (error) {
      console.error("Error publishing case:", error);
      toast.error("Failed to publish case");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      className={cn("relative", className)}
    >
      <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 h-full shadow-md rounded-2xl bg-white dark:bg-gray-900">

        <article className="flex flex-col h-full relative z-10">
          <CardHeader className="space-y-4 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-heading font-bold text-pretty line-clamp-2 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
                  {title}
                </h3>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold px-3 py-1 w-fit rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {case_type}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 items-end shrink-0">
                {is_public ? (
                  <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs flex items-center gap-1.5 px-2.5 py-1">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="font-medium">Public</span>
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 text-xs flex items-center gap-1.5 px-2.5 py-1">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="font-medium">Private</span>
                  </Badge>
                )}
                {hasSimulation && (
                  <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-xs flex items-center gap-1.5 px-2.5 py-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="font-medium">Simulated</span>
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mt-3">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <time dateTime={new Date(created_at).toISOString()} className="font-medium text-gray-600 dark:text-gray-400">
                {formatDate(created_at)}
              </time>
              <span aria-hidden="true" className="text-gray-300 dark:text-gray-600">•</span>
              <div className="inline-flex items-center gap-2">
                <Avatar className="h-6 w-6 ring-2 ring-white dark:ring-gray-900">
                  <AvatarImage
                    src={user?.avatarUrl || "/placeholder.svg"}
                    alt={`${displayUserName}'s avatar`}
                  />
                  <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {getInitials(displayUserName)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[12rem] font-medium text-gray-700 dark:text-gray-300">{displayUserName}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-grow py-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 bg-gray-50 dark:bg-gray-800/50">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleLike}
                    aria-pressed={liked}
                    aria-label={liked ? "Unlike" : "Like"}
                    title={liked ? "Unlike" : "Like"}
                    className={cn(
                      "gap-2",
                      liked ? "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    )}
                  >
                    <motion.div
                      animate={{ scale: liked ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Heart className={cn("h-5 w-5", liked ? "fill-current" : undefined)} />
                    </motion.div>
                    <span className="text-sm font-bold">{likes}</span>
                  </Button>
                </motion.div>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCommentClick}
                    aria-label="Comments"
                    title="Comments"
                    className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm font-bold">{commentCount}</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center gap-2.5 border-t border-gray-200 dark:border-gray-700 pt-5">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
              <Button
                type="button"
                size="sm"
                onClick={handleStartSimulation}
                disabled={loading}
                aria-label="Start new simulation"
                title="Start new simulation"
                className="gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="h-4 w-4" />
                <span className="font-semibold">{loading ? "Starting..." : "Start"}</span>
              </Button>
            </motion.div>
            {hasSimulation && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleReplaySimulation}
                    aria-label="Replay simulation"
                    title="Replay simulation"
                    className="gap-2 w-full bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="font-semibold">Replay</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadReport}
                    aria-label="Download reports"
                    title="Download reports"
                    className="gap-2 w-full border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Download className="h-4 w-4" />
                    <span className="font-semibold">Download</span>
                  </Button>
                </motion.div>
              </>
            )}
            {!is_public && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                <Button
                  type="button"
                  size="sm"
                  onClick={handlePublish}
                  aria-label="Publish case"
                  title="Publish case"
                  className="gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Globe className="h-4 w-4" />
                  <span className="font-semibold">Publish</span>
                </Button>
              </motion.div>
            )}
          </CardFooter>
        </article>
      </Card>
    </motion.div>
  );
}

export default CaseCard;