import React from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { FileText, Download, X } from 'lucide-react';

export const PdfPreviewDialog = ({
  previewOpen, setPreviewOpen, previewName, previewUrl, downloadFile
}) => {
  return (
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 bg-slate-950 border-slate-800 [&>button]:hidden" data-testid="pdf-preview-dialog">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FileText size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-200">{previewName}</h3>
                <p className="text-xs text-slate-500">Document Preview</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadFile(
                  previewUrl,
                  null,
                  previewName
                )}
                className="gap-2"
              >
                <Download size={14} />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewOpen(false)}
                className="hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-slate-900 relative">
            {previewUrl && (
              <iframe
                src={`${process.env.REACT_APP_API_URL}${previewUrl}`}
                className="w-full h-full border-none"
                title="PDF Fullscreen Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
};
