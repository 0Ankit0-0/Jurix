import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/provider/themeProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Mail,
    Phone,
    MapPin,
    Edit,
    Save,
    X,
    Eye,
    EyeOff,
    Heart,
    Camera,
    Upload,
    MessageCircle,
    User,
    Briefcase,
    FileText,
} from "lucide-react"
import api from "@/services/api"
import { toast } from "@/components/ui/toast"
import AvatarUpload from "./avatarupload"


export default function ProfilePage({ userId }) {
    const [isEditing, setIsEditing] = useState(false)
    const [showComments, setShowComments] = useState({})
    const [user, setUser] = useState({})
    const [editedUser, setEditedUser] = useState({})
    const [publishedCases, setPublishedCases] = useState([])
    const [userCases, setUserCases] = useState([])
    const [isPublishingCase, setIsPublishingCase] = useState(null)

    // ✅ Fetch user data
    useEffect(() => {
        if (!userId) return; // ⛔ don't call API without userId

        const fetchUserData = async () => {
            try {
                const res = await api.get(`/auth/${userId}`);
                setUser(res.data);
                setEditedUser(res.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                toast.error("Failed to fetch user data.");
            }
        };

        const fetchPublishedCases = async () => {
            try {
                const res = await api.get(`/auth/${userId}/published-cases`);
                setPublishedCases(res.data);
            } catch (err) {
                console.error("Failed to fetch published cases:", err);
                toast.error("Failed to fetch published cases.");
            }
        };

        const fetchUserCases = async () => {
            try {
                const res = await api.get(`/cases/user/${userId}`);
                setUserCases(res.data.cases || []);
            } catch (err) {
                console.error("Failed to fetch user cases:", err);
                // Don't show error toast for this as it's not critical
            }
        };

        fetchUserData();
        fetchPublishedCases();
        fetchUserCases();
    }, [userId]);

    // ✅ Handlers
    const handleEdit = () => setIsEditing(true)
    const handleCancel = () => {
        setEditedUser(user)
        setIsEditing(false)
    }

    const handleInputChange = (field, value) => {
        setEditedUser({ ...editedUser, [field]: value })
    }

    const handleSave = async () => {
        try {
            const res = await api.put(`/auth/${userId}`, editedUser)
            setUser(res.data)
            setIsEditing(false)
            toast.success("Profile updated successfully!")
        } catch (err) {
            console.error("Failed to save user:", err)
            toast.error("Failed to update profile. Please try again.")
        }
    }

    const handleImageUpload = async (event) => {
        const file = event.target.files[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a valid image file")
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB")
                return
            }

            try {
                // Create FormData for file upload
                const formData = new FormData()
                formData.append('avatar', file)

                // Upload the image
                const uploadResponse = await api.post(`/auth/${userId}/upload-avatar`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                // Update the user state with the uploaded image URL
                const imageUrl = uploadResponse.data.avatar_url
                setEditedUser({ ...editedUser, avatar: imageUrl })
                setUser({ ...user, avatar: imageUrl })

                toast.success("Profile image uploaded successfully!")
            } catch (error) {
                console.error("Image upload failed:", error)
                toast.error("Failed to upload image. Please try again.")
            }
        }
    }

    const toggleCasePrivacy = (id) => {
        setPublishedCases((prev) =>
            prev.map((c) =>
                c.id === id ? { ...c, isPublic: !c.isPublic } : c
            )
        )
    }

    const toggleComments = (id) => {
        setShowComments((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const handlePublishCase = async (caseId, isCurrentlyPublic) => {
        setIsPublishingCase(caseId);

        try {
            if (isCurrentlyPublic) {
                await api.post(`/cases/${caseId}/unpublish`, { user_id: userId });
                toast.success("Case is now private");
            } else {
                await api.post(`/cases/${caseId}/publish`, { user_id: userId });
                toast.success("Case published successfully!");
            }

            // Refresh both published cases and user cases
            const [publishedRes, userCasesRes] = await Promise.all([
                api.get(`/auth/${userId}/published-cases`),
                api.get(`/cases/user/${userId}`)
            ]);

            setPublishedCases(publishedRes.data);
            setUserCases(userCasesRes.data.cases || []);
        } catch (error) {
            console.error("Failed to update case privacy:", error);
            toast.error("Failed to update case privacy");
        } finally {
            setIsPublishingCase(null);
        }
    }

    // ✅ Role-specific UI (extend later with more roles)
    const renderRoleSpecificContent = () => {
        if (user.role === "lawyer") {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>About {user.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {user.name} is a practicing lawyer specializing in constitutional
                            and criminal law.
                        </p>
                    </CardContent>
                </Card>
            )
        }
        return null
    }

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                {/* Cover Photo Section */}
                <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-b">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                </div>

                <main className="container mx-auto px-4 -mt-20 sm:-mt-24 relative z-10">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Profile Header */}
                        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
                            <CardContent className="pt-8 pb-6">
                                <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
                                    {/* Enhanced Avatar Section */}
                                    <div className="flex-shrink-0 relative">
                                        <div className="relative group">
                                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
                                                <AvatarImage 
                                                    src={isEditing ? editedUser.avatar : user.avatar} 
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl sm:text-3xl font-bold">
                                                    {(isEditing ? editedUser.name : user.name)?.charAt(0)?.toUpperCase() || <User className="h-8 w-8 sm:h-12 sm:w-12" />}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            {isEditing && (
                                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <label htmlFor="avatar-upload" className="cursor-pointer">
                                                        <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                                        <input
                                                            id="avatar-upload"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                            
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-success to-success/80 rounded-full border-4 border-background flex items-center justify-center">
                                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Info */}
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                            <div className="space-y-2">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editedUser.name || ''}
                                                        onChange={(e) =>
                                                            handleInputChange("name", e.target.value)
                                                        }
                                                        className="text-2xl sm:text-3xl font-bold bg-transparent border-b-2 border-primary/50 focus:border-primary outline-none px-0 py-1 w-full max-w-md"
                                                        placeholder="Your name"
                                                    />
                                                ) : (
                                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                                        {user.name || 'Anonymous User'}
                                                    </h1>
                                                )}
                                                
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                            <select
                                                                value={editedUser.role || 'user'}
                                                                onChange={(e) => handleInputChange("role", e.target.value)}
                                                                className="px-3 py-1 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                            >
                                                                <option value="user">User</option>
                                                                <option value="lawyer">Lawyer</option>
                                                                <option value="paralegal">Paralegal</option>
                                                                <option value="law_student">Law Student</option>
                                                                <option value="judge">Judge</option>
                                                                <option value="legal_consultant">Legal Consultant</option>
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="secondary" className="capitalize font-medium">
                                                            <Briefcase className="h-3 w-3 mr-1" />
                                                            {user?.role ? user.role.replace("_", " ") : "User"}
                                                        </Badge>
                                                    )}
                                                    {user.email_verified && (
                                                        <Badge variant="outline" className="text-success border-success">
                                                            ✓ Verified
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <Button onClick={handleSave} size="sm" className="bg-primary hover:bg-primary/90">
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Save Changes
                                                        </Button>
                                                        <Button
                                                            onClick={handleCancel}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <X className="h-4 w-4 mr-2" />
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        onClick={handleEdit}
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-primary hover:text-primary-foreground transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Profile
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Information Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                                <div className="p-2 rounded-full bg-primary/10">
                                                    <Mail className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                                                    {isEditing ? (
                                                        <input
                                                            type="email"
                                                            value={editedUser.email || ''}
                                                            onChange={(e) =>
                                                                handleInputChange("email", e.target.value)
                                                            }
                                                            className="w-full bg-transparent border-none outline-none text-sm font-medium text-foreground p-0"
                                                            placeholder="your.email@example.com"
                                                        />
                                                    ) : (
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {user.email || 'Not provided'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                                <div className="p-2 rounded-full bg-accent/10">
                                                    <Phone className="h-4 w-4 text-accent" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                                                    {isEditing ? (
                                                        <input
                                                            type="tel"
                                                            value={editedUser.phone || ''}
                                                            onChange={(e) =>
                                                                handleInputChange("phone", e.target.value)
                                                            }
                                                            className="w-full bg-transparent border-none outline-none text-sm font-medium text-foreground p-0"
                                                            placeholder="+1 (555) 123-4567"
                                                        />
                                                    ) : (
                                                        <p className="text-sm font-medium text-foreground">
                                                            {user.phone || 'Not provided'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                                <div className="p-2 rounded-full bg-success/10">
                                                    <MapPin className="h-4 w-4 text-success" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editedUser.location || ''}
                                                            onChange={(e) =>
                                                                handleInputChange("location", e.target.value)
                                                            }
                                                            className="w-full bg-transparent border-none outline-none text-sm font-medium text-foreground p-0"
                                                            placeholder="City, Country"
                                                        />
                                                    ) : (
                                                        <p className="text-sm font-medium text-foreground">
                                                            {user.location || 'Not provided'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Role-specific Content */}
                        {renderRoleSpecificContent()}

                        {/* Published Cases */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Published Cases</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {publishedCases.length > 0 ? (
                                        publishedCases.map((caseData) => (
                                            <div
                                                key={caseData.id}
                                                className="border rounded-lg p-4 space-y-3"
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <h3 className="font-semibold">{caseData.title}</h3>
                                                            <Badge variant="outline">{caseData.type}</Badge>
                                                            <Badge
                                                                variant={
                                                                    caseData.isPublic ? "default" : "secondary"
                                                                }
                                                            >
                                                                {caseData.isPublic ? "Public" : "Private"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            {caseData.description}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Created: {caseData.createdAt}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleCasePrivacy(caseData.id)}
                                                        className="self-start sm:self-center"
                                                    >
                                                        {caseData.isPublic ? (
                                                            <EyeOff className="h-4 w-4 mr-1" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 mr-1" />
                                                        )}
                                                        {caseData.isPublic ? "Make Private" : "Make Public"}
                                                    </Button>
                                                </div>

                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t gap-2">
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Heart className="h-4 w-4" />
                                                            {caseData.likes}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageCircle className="h-4 w-4" />
                                                            {caseData.comments}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleComments(caseData.id)}
                                                    >
                                                        {showComments[caseData.id]
                                                            ? "Hide Comments"
                                                            : "View Comments"}
                                                    </Button>
                                                </div>

                                                {showComments[caseData.id] && (
                                                    <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
                                                        <h4 className="font-medium mb-2">
                                                            Recent Comments
                                                        </h4>
                                                        {/* ✅ Mock comments */}
                                                        <div className="flex gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="text-xs">
                                                                    JD
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">John Doe</p>
                                                                <p className="text-muted-foreground">
                                                                    Excellent analysis of the constitutional
                                                                    implications!
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">
                                            No published cases yet.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </ThemeProvider>
    )
}
