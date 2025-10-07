import { useState, useEffect } from "react"
import { discussionAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, MessageSquare, Trash2, Send } from "lucide-react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")
}

export function DiscussionThread({ caseId }) {
  const { user } = useAuth()
  const [discussions, setDiscussions] = useState([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadDiscussions()
  }, [caseId])

  const loadDiscussions = async () => {
    try {
      setIsLoading(true)
      const response = await discussionAPI.getDiscussions(caseId)
      setDiscussions(response.data.discussions || [])
    } catch (error) {
      console.error("Error loading discussions:", error)
      toast.error("Failed to load discussions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    if (!user) {
      toast.error("Please login to comment")
      return
    }

    try {
      setIsSubmitting(true)
      await discussionAPI.addDiscussion(caseId, {
        user_id: user.id || user._id,
        username: user.name || "Anonymous",
        content: newComment.trim(),
      })
      
      setNewComment("")
      toast.success("Comment added successfully")
      await loadDiscussions()
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (discussionId) => {
    try {
      await discussionAPI.likeDiscussion(discussionId)
      await loadDiscussions()
    } catch (error) {
      console.error("Error liking discussion:", error)
      toast.error("Failed to like comment")
    }
  }

  const handleDelete = async (discussionId) => {
    if (!user) return

    try {
      await discussionAPI.deleteDiscussion(discussionId, user.id || user._id)
      toast.success("Comment deleted")
      await loadDiscussions()
    } catch (error) {
      console.error("Error deleting discussion:", error)
      toast.error("Failed to delete comment")
    }
  }

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Add a Comment</h3>
        <div className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this case..."
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({discussions.length})
        </h3>

        {isLoading ? (
          <div className="glass-card rounded-2xl p-6 text-center text-muted-foreground">
            Loading comments...
          </div>
        ) : discussions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div
                  key={discussion._id || discussion.discussion_id}
                  className="glass-card rounded-2xl p-6 space-y-4 animate-fade-in"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(discussion.username || "Anonymous")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">
                            {discussion.username || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(discussion.created_at)}
                          </span>
                        </div>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {discussion.content}
                        </p>
                      </div>
                    </div>
                    {user && (user.id === discussion.user_id || user._id === discussion.user_id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(discussion._id || discussion.discussion_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(discussion._id || discussion.discussion_id)}
                      className="gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{discussion.likes || 0}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}

export default DiscussionThread