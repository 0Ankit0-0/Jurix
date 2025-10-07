import { FileText, Image, File, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function EvidenceList({ caseData, setCaseData }) {
    const removeEvidence = (id) => {
        setCaseData((prev) => ({
            ...prev,
            evidence: prev.evidence.filter((e) => e.id !== id),
        }))
    }

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase()
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
            return <Image className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
        } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
            return <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
        } else {
            return <File className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileTypeColor = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase()
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        } else if (['pdf'].includes(extension)) {
            return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
        } else if (['doc', 'docx'].includes(extension)) {
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        } else if (['txt'].includes(extension)) {
            return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
        } else if (['mp3', 'wav'].includes(extension)) {
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
        } else if (['mp4'].includes(extension)) {
            return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
        } else {
            return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
        }
    }

    if (!caseData.evidence.length) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-medium text-foreground font-body">
                    Uploaded Files ({caseData.evidence.length})
                </h3>
                <Badge variant="outline" className="text-xs font-body">
                    {caseData.evidence.reduce((total, file) => total + file.size, 0) > 1024 * 1024 
                        ? `${(caseData.evidence.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB total`
                        : `${Math.round(caseData.evidence.reduce((total, file) => total + file.size, 0) / 1024)} KB total`
                    }
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {caseData.evidence.map((item) => (
                    <div key={item.id} className="group border border-border rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:border-primary/50 bg-card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="flex-shrink-0">
                                    {getFileIcon(item.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium text-sm sm:text-base text-foreground truncate font-body">
                                            {item.name}
                                        </p>
                                        <Badge 
                                            variant="secondary" 
                                            className={`text-xs px-2 py-0.5 font-body ${getFileTypeColor(item.name)}`}
                                        >
                                            {item.name.split('.').pop()?.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground font-body">
                                        <span>{formatFileSize(item.size)}</span>
                                        <span>•</span>
                                        <span>Ready for analysis</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent/50 hover:text-accent-foreground"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Preview</span>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeEvidence(item.id)} 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}