import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import api from "@/services/api"

const AvatarUpload = ({ user, setUser, isEditing }) => {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileSelect = (file) => {
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file (JPG, PNG, GIF, etc.)')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB')
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreview(e.target.result)
        }
        reader.readAsDataURL(file)

        // Upload immediately
        uploadAvatar(file)
    }

    const handleInputChange = (event) => {
        const file = event.target.files[0]
        handleFileSelect(file)
    }

    const handleDrop = (event) => {
        event.preventDefault()
        setDragOver(false)
        const file = event.dataTransfer.files[0]
        handleFileSelect(file)
    }

    const handleDragOver = (event) => {
        event.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = (event) => {
        event.preventDefault()
        setDragOver(false)
    }

    const uploadAvatar = async (file) => {
        setUploading(true)
        try {
            // Create object URL for immediate preview
            const imageUrl = URL.createObjectURL(file)
            setPreview(imageUrl)
            
            // Real implementation - upload to backend
            const formData = new FormData()
            formData.append('avatar', file)
            formData.append('userId', user._id || user.id)

            const response = await api.post('/upload/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (response.data.avatarUrl) {
                // Update user with server URL
                const updatedUser = { ...user, avatar: response.data.avatarUrl }
                setUser(updatedUser)
                
                // Update localStorage to persist across sessions
                localStorage.setItem('user_data', JSON.stringify(updatedUser))
                
                setPreview(null)
                toast.success('Profile photo updated successfully!')
            }
        } catch (error) {
            console.error('Avatar upload failed:', error)
            toast.error('Failed to upload profile photo')
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    const removeAvatar = async () => {
        try {
            // Real implementation - delete from backend
            await api.delete(`/upload/avatar/${user._id || user.id}`)
            
            const updatedUser = { ...user, avatar: '' }
            setUser(updatedUser)
            
            // Update localStorage to persist across sessions
            localStorage.setItem('user_data', JSON.stringify(updatedUser))
            
            setPreview(null)
            toast.success('Profile photo removed')
        } catch (error) {
            console.error('Failed to remove avatar:', error)
            toast.error('Failed to remove profile photo')
        }
    }

    if (!isEditing) {
        return (
            <div className="relative">
                <Avatar className="h-24 w-24 mx-auto md:mx-0 ring-2 ring-border">
                    <AvatarImage 
                        src={user.avatar} 
                        alt={user.name}
                        className="object-cover"
                    />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {user.name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Current Avatar */}
            <div className="relative">
                <Avatar className="h-24 w-24 mx-auto md:mx-0 ring-2 ring-border">
                    <AvatarImage 
                        src={preview || user.avatar} 
                        alt={user.name}
                        className="object-cover"
                    />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {user.name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>

                {/* Upload Status Overlay */}
                {uploading && (
                    <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}

                {/* Quick Action Buttons */}
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 rounded-full p-0 shadow-md hover:shadow-lg transition-shadow"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        title="Change photo"
                    >
                        <Camera className="h-4 w-4" />
                    </Button>
                    
                    {(user.avatar || preview) && (
                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 rounded-full p-0 shadow-md hover:shadow-lg transition-shadow"
                            onClick={removeAvatar}
                            disabled={uploading}
                            title="Remove photo"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Upload Area */}
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                    <div
                        className={`text-center space-y-3 ${
                            dragOver ? 'bg-primary/5 rounded-lg p-2' : ''
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="flex justify-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <ImageIcon className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                {dragOver ? 'Drop your image here' : 'Upload a new photo'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Drag and drop or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">
                                JPG, PNG, GIF up to 5MB
                            </p>
                        </div>

                        <div className="flex gap-2 justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="text-xs"
                            >
                                <Upload className="h-3 w-3 mr-1" />
                                Browse Files
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
            />

            {/* Upload Progress/Status */}
            {uploading && (
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading your photo...
                    </div>
                </div>
            )}
        </div>
    )
}

export default AvatarUpload

