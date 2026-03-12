import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

export const VpConfirmDialog = ({
  showVpConfirmDialog, setShowVpConfirmDialog, setPendingApprovalAction, handleVpConfirmApproval
}) => {
  return (
      <Dialog open={showVpConfirmDialog} onOpenChange={setShowVpConfirmDialog}>
        <DialogContent className="max-w-md" data-testid="vp-confirm-dialog" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Confirm Early Approval</DialogTitle>
            <DialogDescription>
              Are you sure want to approve this report? (Manager has not approved yet)
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowVpConfirmDialog(false);
                setPendingApprovalAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleVpConfirmApproval}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
};
