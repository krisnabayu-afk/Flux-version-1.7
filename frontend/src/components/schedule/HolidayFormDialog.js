import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export const HolidayFormDialog = ({
  holidayFormOpen, setHolidayFormOpen, editingHoliday, handleHolidaySubmit, holidayFormData, setHolidayFormData
}) => {
  return (
      <Dialog open={holidayFormOpen} onOpenChange={setHolidayFormOpen}>
        <DialogContent className="max-w-md" data-testid="holiday-form-dialog">
          <DialogHeader>
            <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleHolidaySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="holiday-start-date">Start Date</Label>
                <Input
                  id="holiday-start-date"
                  type="date"
                  value={holidayFormData.start_date}
                  onChange={(e) => setHolidayFormData({ ...holidayFormData, start_date: e.target.value })}
                  required
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holiday-end-date">End Date</Label>
                <Input
                  id="holiday-end-date"
                  type="date"
                  value={holidayFormData.end_date}
                  onChange={(e) => setHolidayFormData({ ...holidayFormData, end_date: e.target.value })}
                  className="bg-background text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday-description">Description</Label>
              <Input
                id="holiday-description"
                value={holidayFormData.description}
                onChange={(e) => setHolidayFormData({ ...holidayFormData, description: e.target.value })}
                required
                placeholder="National Holiday, Eid, etc."
                className="bg-background text-foreground"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setHolidayFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                {editingHoliday ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
};
