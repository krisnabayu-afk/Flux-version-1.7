import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { FileText, Plus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import moment from 'moment';


export const DailySummaryDialog = ({
  dailySummaryOpen, setDailySummaryOpen, selectedDate, currentHoliday, morningBriefingUrl, setShowPdfPreview, currentDailySchedules, getStatusBadge, eventStyleGetter, handleEdit, handleDelete, canModifySchedule, handleScheduleClick, canEdit, handleAddScheduleFromSummary, users
}) => {
  return (
    <Dialog open={dailySummaryOpen} onOpenChange={setDailySummaryOpen}>
      <DialogContent className="max-w-2xl" data-testid="daily-summary-dialog" onCloseAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <CalendarIcon size={20} />
              <span>Daily Schedule Summary - {moment(selectedDate).format('MMMM DD, YYYY')}</span>
            </DialogTitle>
            <div className="flex items-center space-x-2 mr-8">
              {canEdit && (
                <Button
                  size="sm"
                  className="bg-gray-600 hover:bg-gray-700"
                  onClick={handleAddScheduleFromSummary}
                >
                  <Plus size={16} className="mr-1" />
                  Add Schedule
                </Button>
              )}
              {morningBriefingUrl && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-blue-500 hover:bg-blue-900/20 w-8 h-8 rounded-full"
                  onClick={() => setShowPdfPreview(true)}
                  title="View Morning Briefing"
                >
                  <FileText size={18} />
                </Button>
              )}
            </div>
          </div>
          <DialogDescription>
            View the list of schedules for this specific day.
          </DialogDescription>
          {currentHoliday && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3 text-red-400">
              <div className="bg-red-500/20 p-2 rounded-full">
                <CalendarIcon size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-sm uppercase tracking-wider">Public Holiday</p>
                <p className="text-base font-semibold">{currentHoliday.description}</p>
              </div>
            </div>
          )}
        </DialogHeader>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {currentDailySchedules.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No schedules for this day</p>
          ) : (
            currentDailySchedules.map(schedule => (
              <Card
                key={schedule.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                style={{ borderLeftColor: eventStyleGetter({ resource: schedule }).style.backgroundColor }}
                onClick={() => handleScheduleClick(schedule)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>{schedule.title}</span>
                    <div className="flex items-center space-x-2">
                      {canModifySchedule(schedule) && (
                        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:bg-gray-700"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                      <span className="text-xs font-normal text-slate-400">Details</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-semibold">Person:</span> {schedule.user_name}
                      </div>
                      <div>
                        <span className="font-semibold">Division:</span> {schedule.division}
                      </div>
                      {schedule.site_name && (
                        <div className="col-span-2">
                          <span className="font-semibold">Site:</span> {schedule.site_name}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Start:</span> {moment(schedule.start_date).format('HH:mm')}
                      </div>
                    </div>
                    {(() => {
                      const scheduleUser = users.find(u => u.id === schedule.user_id);
                      const photoData = scheduleUser?.profile_photo;
                      if (!scheduleUser) return null;
                      return (
                        <Avatar className="h-12 w-12 border border-slate-700 flex-shrink-0">
                          {photoData ? (
                            <AvatarImage src={`data:image/jpeg;base64,${photoData}`} alt={schedule.user_name} />
                          ) : (
                            <AvatarFallback className="bg-slate-800 text-slate-300">
                              {schedule.user_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      );
                    })()}
                  </div>
                  {schedule.description && (
                    <div className="pt-2 border-t border-slate-700/50">
                      <span className="font-semibold">Description:</span> {schedule.description}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
