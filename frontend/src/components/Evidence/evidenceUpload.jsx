import { Upload, FileText, Image, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function EvidenceUpload({ setCaseData }) {
    const [dragActive, setDragActive] = useState(false)

    const handleFileUpload = (files) => {
        const fileArray = Array.from(files).map((file, idx) => ({
            id: Date.now() + "-" + idx,
            name: file.name,
            size: file.size,
            type: file.type,
            aiSummary: "",
            file: file // Store the actual file object
        }))
        setCaseData((prev) => ({ ...prev, evidence: [...prev.evidence, ...fileArray] }))
    }

    const handleInputChange = (e) => {
        if (e.target.files) {
            handleFileUpload(e.target.files)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files)
        }
    }

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase()
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
            return <Image className="h-5 w-5 text-blue-500" />
        } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
            return <FileText className="h-5 w-5 text-green-500" />
        } else {
            return <File className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-10 text-center transition-all duration-200 ${
                    dragActive
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/10"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="space-y-4 sm:space-y-6">
                    <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                    </div>
                    
                    <div>
                        <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground mb-2">
                            Upload Evidence Files
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4 font-body">
                            Drag and drop files here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground font-body">
                            Supports: PDF, DOC, DOCX, TXT, JPG, PNG, MP3, MP4, WAV (Max 16MB each)
                        </p>
                    </div>

                    <input
                        type="file"
                        multiple
                        onChange={handleInputChange}
                        className="hidden"
                        id="evidence-upload"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp3,.mp4,.wav"
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button asChild variant="outline" className="hover:bg-accent/50 transition-colors duration-200">
                            <label htmlFor="evidence-upload" className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium font-body">
                                <FileText className="h-4 w-4" />
                                Choose Files
                            </label>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200">
                            <label htmlFor="evidence-upload" className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium font-body">
                                <Upload className="h-4 w-4" />
                                Upload Evidence
                            </label>
                        </Button>
                    </div>
                </div>
            </div>

            {/* File Type Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div>
                        <p className="font-medium font-body">Documents</p>
                        <p className="text-muted-foreground font-body">PDF, DOC, DOCX, TXT</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Image className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div>
                        <p className="font-medium font-body">Images</p>
                        <p className="text-muted-foreground font-body">JPG, PNG, GIF</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <File className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <div>
                        <p className="font-medium font-body">Media</p>
                        <p className="text-muted-foreground font-body">MP3, MP4, WAV</p>
                    </div>
                </div>
            </div>
        </div>
    )
}