import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import moment from 'moment';

export const HolidayManagementDialog = ({
  holidayDialogOpen, setHolidayDialogOpen, holidays, setEditingHoliday, setHolidayFormData, setHolidayFormOpen, handleDeleteHoliday
}) => {
  return (
    <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" data-testid="holiday-management-dialog">
        <DialogHeader>
          <DialogTitle>Holiday Management</DialogTitle>
          <DialogDescription>Add or remove dates that should be marked as "Tanggal Merah".</DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-foreground">Current Holidays</h3>
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => {
              setEditingHoliday(null);
              setHolidayFormData({
                start_date: moment().format('YYYY-MM-DD'),
                end_date: moment().format('YYYY-MM-DD'),
                description: '',
                is_recurring: false
              });
              setHolidayFormOpen(true);
            }}
            data-testid="add-holiday-button"
          >
            <Plus size={16} className="mr-1" /> Add Holiday
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {holidays.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No holidays defined yet.</p>
          ) : (
            <div className="space-y-2">
              {[...holidays].sort((a, b) => a.start_date.localeCompare(b.start_date)).map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-foreground">
                      {moment(holiday.start_date).format('MMMM DD')}
                      {holiday.end_date && holiday.end_date !== holiday.start_date ? ` - ${moment(holiday.end_date).format('MMMM DD, YYYY')}` : `, ${moment(holiday.start_date).format('YYYY')}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{holiday.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      onClick={() => {
                        setEditingHoliday(holiday);
                        setHolidayFormData({
                          start_date: holiday.start_date,
                          end_date: holiday.end_date || holiday.start_date,
                          description: holiday.description,
                          is_recurring: holiday.is_recurring || false
                        });
                        setHolidayFormOpen(true);
                      }}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteHoliday(holiday.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
