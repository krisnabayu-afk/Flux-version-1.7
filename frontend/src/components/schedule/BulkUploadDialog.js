import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Upload, Download } from 'lucide-react';

export const BulkUploadDialog = ({
  bulkUploadOpen, setBulkUploadOpen, handleBulkUpload, setUploadFile, downloadTemplate
}) => {
  return (
              <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90" data-testid="bulk-upload-button">
                    <Upload size={18} className="mr-2" />
                    Bulk Upload
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="bulk-upload-dialog" onCloseAutoFocus={(e) => e.preventDefault()}>
                  <DialogHeader>
                    <DialogTitle>Bulk Upload Schedules</DialogTitle>
                    <DialogDescription>Upload a CSV or Excel file to create multiple schedules at once.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleBulkUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload CSV or Excel File</Label>
                      <Input
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        data-testid="bulk-upload-input"
                      />
                      <p className="text-xs text-slate-500">Required columns: user_email, title, description, start_date</p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={downloadTemplate}
                      className="w-full"
                      data-testid="download-template-button"
                    >
                      <Download size={16} className="mr-2" />
                      Download Template
                    </Button>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setBulkUploadOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90" data-testid="upload-submit-button">
                        Upload
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
  );
};
