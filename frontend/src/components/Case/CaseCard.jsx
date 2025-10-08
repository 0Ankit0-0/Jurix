import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Play, RotateCcw, Download, Globe, Lock, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function formatDate(input) {
  if (!input) return "N/A";
  const date = new Date(input);
  if (isNaN(date)) return "Invalid Date";
  return new Intl.DateTimeFormat('en-US', {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return "GU";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function CaseCard({ caseData, showPublicToggle = false }) {
  const navigate = useNavigate();
  const {
    case_id,
    title,
    description,
    case_type,
    created_at,
    user,
    likeCount: initialLikeCount = 0,
    commentCount = 0,
    is_public = false,
    simulation_results = null,
    onLikeToggle,
    onCommentClick,
    onStart,
    onReplay,
    onDownload,
    onTogglePublic,
  } = caseData;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const hasSimulation = !!simulation_results;
  const displayUserName = user?.name || "Anonymous";

  const handleToggleLike = async () => {
    if (!onLikeToggle) return;
    setIsLikeLoading(true);
    const newLikedState = !isLiked;

    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      await onLikeToggle(newLikedState);
    } catch (error) {
      setIsLiked(!newLikedState);
      setLikeCount(prev => !newLikedState ? prev + 1 : Math.max(0, prev - 1));
      toast.error("Could not update like.");
    } finally {
      setIsLikeLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      <Card className="group relative flex flex-col h-full overflow-hidden bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-xl border-2 border-border/40 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 rounded-2xl">
        {/* Animated gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 -z-10"></div>

        <CardHeader className="p-6 space-y-4 z-10">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold text-pretty line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300 leading-snug font-heading group-hover:translate-x-1 transition-transform">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="w-fit font-semibold bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 group-hover:border-primary/50 transition-colors">{case_type}</Badge>
            {is_public ? (
              <Badge variant="outline" className="border-primary/50 text-primary bg-gradient-to-r from-primary/15 to-primary/10 text-xs font-semibold shadow-sm">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs font-semibold bg-gradient-to-r from-secondary to-secondary/80 shadow-sm">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
            {hasSimulation && (
              <Badge variant="outline" className="border-success/50 text-success bg-gradient-to-r from-success/15 to-success/10 text-xs font-semibold shadow-sm">
                <Sparkles className="h-3 w-3 mr-1 fill-success/20" />
                Simulated
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 flex-grow z-10">
          <p className="text-sm text-muted-foreground group-hover:text-foreground/80 line-clamp-3 leading-relaxed transition-colors duration-300">
            {description}
          </p>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-4 p-6 pt-4 mt-auto z-10">
          <div className="w-full pt-4 border-t border-gradient-to-r from-transparent via-border/50 to-transparent group-hover:via-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground transition-colors duration-300">
            <time dateTime={new Date(created_at).toISOString()} className="font-medium">
              {formatDate(created_at)}
            </time>
            <div className="inline-flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={user?.avatarUrl}
                  alt={`${displayUserName}'s avatar`}
                />
                <AvatarFallback className="text-xs bg-muted">
                  {getInitials(displayUserName)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[12rem] font-medium text-foreground">{displayUserName}</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center -ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleLike}
                disabled={isLikeLoading}
                className={cn(
                  "gap-1.5 text-muted-foreground hover:text-primary px-2",
                  isLiked && "text-primary"
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                <span className="text-sm font-semibold w-5 text-left">{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCommentClick}
                className="gap-1.5 text-muted-foreground hover:text-primary px-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-semibold w-5 text-left">{commentCount}</span>
              </Button>
            </div>
            {showPublicToggle && onTogglePublic && (
              <Button variant="ghost" size="sm" onClick={onTogglePublic} className="text-xs px-2 h-8">
                {is_public ? <Lock className="h-3 w-3 mr-1.5" /> : <Globe className="h-3 w-3 mr-1.5" />}
                {is_public ? 'Make Private' : 'Make Public'}
              </Button>
            )}
          </div>

          <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-gradient-to-r from-transparent via-border/50 to-transparent">
            <Button size="sm" onClick={onStart} className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-300">
              <Play className="h-4 w-4 mr-1.5" /> Start
            </Button>
            <Button size="sm" variant="secondary" onClick={onReplay} disabled={!hasSimulation} className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary/80 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50">
              <RotateCcw className="h-4 w-4 mr-1.5" /> Replay
            </Button>
            <Button size="sm" variant="outline" onClick={onDownload} disabled={!hasSimulation} className="w-full border-2 hover:border-primary/50 hover:bg-primary/5 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50">
              <Download className="h-4 w-4 mr-1.5" /> Report
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default CaseCard;
