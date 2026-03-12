import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Star, Check } from 'lucide-react';

export const RatingDialog = ({
  showRatingDialog, setShowRatingDialog, setPendingRatingAction, approvalRating, setApprovalRating, hoverRating, setHoverRating, approvalNotes, setApprovalNotes, handleRatingApprovalSubmit
}) => {
  return (
      <Dialog open={showRatingDialog} onOpenChange={(open) => { if (!open) { setShowRatingDialog(false); setPendingRatingAction(null); } }}>
        <DialogContent className="max-w-md" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              Approve &amp; Rate Report
            </DialogTitle>
            <DialogDescription>
              Provide a performance rating for this report before approving.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-3 block">Rating <span className="text-red-400">*</span></Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setApprovalRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={(
                        star <= (hoverRating || approvalRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted-foreground'
                      ) + ' transition-colors'}
                    />
                  </button>
                ))}
                {approvalRating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][approvalRating]}
                  </span>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="approval-notes" className="text-sm font-medium mb-2 block">Notes / Feedback <span className="text-muted-foreground text-xs">(Optional)</span></Label>
              <Textarea
                id="approval-notes"
                placeholder="Leave feedback for the report author..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowRatingDialog(false); setPendingRatingAction(null); }}>Cancel</Button>
            <Button
              type="button"
              onClick={handleRatingApprovalSubmit}
              disabled={approvalRating < 1}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check size={16} className="mr-1" />
              Confirm Approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
};
