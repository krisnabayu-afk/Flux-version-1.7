import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Check } from 'lucide-react';
import { SiteCombobox } from './SiteCombobox';
import { TicketCombobox } from './TicketCombobox';

export const EditReportDialog = ({
  editOpen, setEditOpen,
  handleEditSubmit,
  editFormData, setEditFormData,
  sites, tickets, selectedReport
}) => {
  return (
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col" data-testid="edit-report-dialog" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
          </DialogHeader>
          <form id="edit-report-form" onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                required
                data-testid="edit-title-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                required
                rows={4}
                data-testid="edit-description-input"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Site (Optional)</Label>
                <SiteCombobox
                  sites={sites}
                  value={editFormData.site_id}
                  onChange={(val) => setEditFormData({ ...editFormData, site_id: val })}
                />
              </div>

              <div className="space-y-2">
                <Label>Link to Ticket (Optional)</Label>
                <TicketCombobox
                  tickets={tickets}
                  value={editFormData.ticket_id}
                  onChange={(val) => setEditFormData({ ...editFormData, ticket_id: val })}
                />
              </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Attachments</h4>

              <div className="space-y-2">
                <Label htmlFor="edit-file" className="text-xs">Replace File 1</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="edit-file"
                    type="file"
                    onChange={(e) => setEditFormData({ ...editFormData, file: e.target.files[0] })}
                    data-testid="edit-file-input"
                    accept=".pdf,.doc,.docx,.xlsx,.xls"
                    className="cursor-pointer bg-background"
                  />
                </div>
                {selectedReport && selectedReport.file_name && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Check size={12} className="text-green-500" /> Current: {selectedReport.file_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-file-2" className="text-xs">Replace File 2</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="edit-file-2"
                    type="file"
                    onChange={(e) => setEditFormData({ ...editFormData, file_2: e.target.files[0] })}
                    data-testid="edit-file-2-input"
                    accept=".pdf,.doc,.docx,.xlsx,.xls"
                    className="cursor-pointer bg-background"
                  />
                </div>
                {selectedReport && selectedReport.file_2_name && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Check size={12} className="text-green-500" /> Current: {selectedReport.file_2_name}
                  </p>
                )}
              </div>
            </div>
          </form>
          <div className="pt-4 border-t mt-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-report-form" className="bg-gray-600 hover:bg-gray-700" data-testid="update-report-button">
              Update Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
};
