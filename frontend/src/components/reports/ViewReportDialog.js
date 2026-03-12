import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Download, Check, X, Trash2, FileText, Star } from 'lucide-react';

export const ViewReportDialog = ({
  viewOpen, setViewOpen,
  selectedReport, selectedVersionData, selectedVersion, handleVersionChange, revisions,
  downloadFile, setPreviewUrl, setPreviewName, setPreviewOpen, setExcelPreviewUrl, setExcelPreviewName, setExcelPreviewOpen,
  canApprove, handleApproval, canCancelApproval, handleCancelApproval,
  handleAddComment, commentText, setCommentText,
  canEditReport, handleDeleteReport, getStatusColor
}) => {
  return (
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" data-testid="view-report-dialog" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>View the details of the selected report.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {selectedReport && (
              <div className="space-y-6">

                {/* Header Info */}
                <div className="border-b pb-4">
                  <h3 className="font-bold text-2xl text-foreground mb-2">
                    {selectedVersionData?.title || selectedReport.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedVersionData?.description || selectedReport.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-secondary p-4 rounded-lg">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Submitted By</p>
                    <p className="font-medium text-foreground truncate">{selectedReport.submitted_by_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Status</p>
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {selectedReport.status}
                    </Badge>
                  </div>
                  {selectedReport.category_name && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Category</p>
                      <p className="font-medium text-foreground truncate">{selectedReport.category_name}</p>
                    </div>
                  )}
                  {selectedReport.site_name && (
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Site</p>
                      <p className="font-medium text-foreground break-all" title={selectedReport.site_name}>
                        {selectedReport.site_name}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 flex items-center justify-between">
                      Version
                      {selectedVersion !== 'current' && (
                        <Badge variant="outline" className="h-4 text-[10px] px-1 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                          History
                        </Badge>
                      )}
                    </p>
                    {revisions.length > 0 ? (
                      <Select value={selectedVersion} onValueChange={handleVersionChange}>
                        <SelectTrigger className="h-8 bg-slate-900/50 border-slate-700 text-slate-200">
                          <SelectValue placeholder="Version" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current">Version {selectedReport.version} (Latest)</SelectItem>
                          {revisions.map((rev) => (
                            <SelectItem key={rev.version} value={rev.version.toString()}>
                              Version {rev.version} ({new Date(rev.updated_at).toLocaleDateString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium text-foreground">
                        {selectedVersionData?.version || selectedReport.version}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Created / Updated</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedVersionData?.updated_at || selectedReport.updated_at || selectedReport.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Documents Section - Grid Layout */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Document 1 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">File 1</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => downloadFile(
                            selectedVersionData?.file_url || selectedReport.file_url,
                            selectedVersionData?.file_data || selectedReport.file_data,
                            selectedVersionData?.file_name || selectedReport.file_name
                          )}
                        >
                          <Download size={12} className="mr-1" /> Download
                        </Button>
                      </div>
                      <div
                        className="bg-muted border border-border rounded-lg overflow-hidden h-[120px] flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-accent transition-colors group relative"
                        onClick={() => {
                          const fileName = selectedVersionData?.file_name || selectedReport.file_name;
                          const fileUrl = selectedVersionData?.file_url || selectedReport.file_url;
                          const fileData = selectedVersionData?.file_data || selectedReport.file_data;

                          const isExcel = fileName && (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls'));
                          if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
                            setPreviewUrl(fileUrl);
                            setPreviewName(fileName);
                            setPreviewOpen(true);
                          } else if (isExcel) {
                            setExcelPreviewUrl(fileUrl);
                            setExcelPreviewName(fileName);
                            setExcelPreviewOpen(true);
                          } else {
                            downloadFile(fileUrl, fileData, fileName);
                          }
                        }}
                      >
                        {(() => {
                          const fileName = selectedVersionData?.file_name || selectedReport.file_name;
                          const isPdf = fileName && fileName.toLowerCase().endsWith('.pdf');
                          const isExcel = fileName && (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls'));

                          if (isPdf) {
                            return (
                              <>
                                <FileText size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-foreground text-xs">Preview PDF</p>
                              </>
                            );
                          } else if (isExcel) {
                            return (
                              <>
                                <FileText size={24} className="text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-foreground text-xs">Preview Excel</p>
                              </>
                            );
                          } else {
                            return (
                              <>
                                <FileText size={24} className="text-muted-foreground mb-2" />
                                <p className="font-medium text-muted-foreground text-xs">Preview unavailable</p>
                              </>
                            );
                          }
                        })()}
                        <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-full px-2">
                          {selectedVersionData?.file_name || selectedReport.file_name}
                        </p>
                      </div>
                    </div>

                    {/* Document 2 */}
                    {selectedReport.file_2_url ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">File 2</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => downloadFile(
                              selectedVersionData?.file_2_url || selectedReport.file_2_url,
                              selectedVersionData?.file_2_data || selectedReport.file_2_data,
                              selectedVersionData?.file_2_name || selectedReport.file_2_name
                            )}
                          >
                            <Download size={12} className="mr-1" /> Download
                          </Button>
                        </div>
                        <div
                          className="bg-muted border border-border rounded-lg overflow-hidden h-[120px] flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-accent transition-colors group relative"
                          onClick={() => {
                            const fileName = selectedVersionData?.file_2_name || selectedReport.file_2_name;
                            const fileUrl = selectedVersionData?.file_2_url || selectedReport.file_2_url;
                            const fileData = selectedVersionData?.file_2_data || selectedReport.file_2_data;

                            const isExcel = fileName && (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls'));
                            if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
                              setPreviewUrl(fileUrl);
                              setPreviewName(fileName);
                              setPreviewOpen(true);
                            } else if (isExcel) {
                              setExcelPreviewUrl(fileUrl);
                              setExcelPreviewName(fileName);
                              setExcelPreviewOpen(true);
                            } else {
                              downloadFile(fileUrl, fileData, fileName);
                            }
                          }}
                        >
                          {(() => {
                            const fileName = selectedVersionData?.file_2_name || selectedReport.file_2_name;
                            const isPdf = fileName && fileName.toLowerCase().endsWith('.pdf');
                            const isExcel = fileName && (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls'));

                            if (isPdf) {
                              return (
                                <>
                                  <FileText size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                                  <p className="font-medium text-foreground text-xs">PDF Document</p>
                                </>
                              );
                            } else if (isExcel) {
                              return (
                                <>
                                  <FileText size={24} className="text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                                  <p className="font-medium text-foreground text-xs">Preview Excel</p>
                                </>
                              );
                            } else {
                              return (
                                <>
                                  <FileText size={24} className="text-muted-foreground mb-2" />
                                  <p className="font-medium text-muted-foreground text-xs">Preview unavailable</p>
                                </>
                              );
                            }
                          })()}
                          <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-full px-2">
                            {selectedVersionData?.file_2_name || selectedReport.file_2_name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 opacity-50 pointer-events-none">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">File 2</span>
                        </div>
                        <div className="bg-muted/50 border border-border/50 border-dashed rounded-lg h-[120px] flex flex-col items-center justify-center p-4">
                          <p className="text-xs text-muted-foreground">No second file</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating Section - Show when report has ratings */}
                {(selectedReport.manager_rating || selectedReport.vp_rating || selectedReport.final_score) && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      Performance Rating
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedReport.manager_rating && (
                        <div className="bg-muted/50 rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Manager Rating</p>
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={16} className={s <= selectedReport.manager_rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} />
                            ))}
                            <span className="ml-1 text-sm font-semibold">{selectedReport.manager_rating}/5</span>
                          </div>
                          {selectedReport.manager_notes && <p className="text-xs text-muted-foreground italic">"{selectedReport.manager_notes}"</p>}
                        </div>
                      )}
                      {selectedReport.vp_rating && (
                        <div className="bg-muted/50 rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">VP Rating</p>
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={16} className={s <= selectedReport.vp_rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} />
                            ))}
                            <span className="ml-1 text-sm font-semibold">{selectedReport.vp_rating}/5</span>
                          </div>
                          {selectedReport.vp_notes && <p className="text-xs text-muted-foreground italic">"{selectedReport.vp_notes}"</p>}
                        </div>
                      )}
                    </div>
                    {selectedReport.final_score != null && (
                      <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-yellow-400">Final Score</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={18} className={s <= Math.round(selectedReport.final_score) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} />
                          ))}
                          <span className="ml-2 text-lg font-bold text-yellow-400">{selectedReport.final_score.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Approval Actions in Modal */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  {canApprove(selectedReport) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproval(selectedReport.id, 'approve')}
                        className="text-green-400 border-green-400 hover:bg-green-900/20"
                      >
                        <Check size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproval(selectedReport.id, 'revisi')}
                        className="text-orange-400 border-orange-400 hover:bg-orange-900/20"
                      >
                        <X size={14} className="mr-1" />
                        Revisi
                      </Button>
                    </>
                  )}
                  {canCancelApproval(selectedReport) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelApproval(selectedReport.id)}
                      className="text-red-400 border-red-400 hover:bg-red-900/20"
                    >
                      <X size={14} className="mr-1" />
                      Cancel Approval
                    </Button>
                  )}
                </div>

                {/* Comments Section */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Comments</h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto mb-4 custom-scrollbar">
                    {selectedReport.comments && selectedReport.comments.length > 0 ? (
                      selectedReport.comments.map((comment, index) => (
                        <div key={index} className="bg-muted border border-border p-3 rounded-lg text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-foreground">{comment.user_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-foreground">{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No comments yet.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" disabled={!commentText.trim()}>
                      Post
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
          {/* Footer Action Buttons */}
          {selectedReport && canEditReport(selectedReport) && (
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => handleDeleteReport(selectedReport.id)}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Report
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
  );
};
