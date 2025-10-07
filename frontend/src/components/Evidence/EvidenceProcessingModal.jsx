import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, CheckCircle } from "lucide-react";

export function EvidenceProcessingModal({ isOpen, evidence, processingStatus }) {
  const totalFiles = evidence.length;
  const processedFiles = evidence.filter(file => file.processed).length;
  const progress = totalFiles ? (processedFiles / totalFiles) * 100 : 0;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Processing Evidence</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current File Status */}
          <div className="space-y-3">
            {evidence.map((file, index) => (
              <div key={index} className="flex items-center gap-3">
                {file.processed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : file.processing ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.processed 
                      ? 'Processed successfully'
                      : file.processing
                      ? 'Processing...'
                      : 'Waiting...'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Processing Message */}
          <div className="text-center text-sm text-muted-foreground">
            {processingStatus || 'Processing evidence files... This may take a few minutes.'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}