import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import moment from 'moment';
import { OptimizedMultiStaffCombobox as MultiStaffCombobox } from '../SelectionComponents';
import SiteCombobox from '../SiteCombobox';

export const TicketDialogs = ({
    ticket,
    showScheduleDialog, setShowScheduleDialog,
    showReportDialog, setShowReportDialog,
    showEditDialog, setShowEditDialog,
    scheduleForm, setScheduleForm, handleCreateSchedule,
    reportForm, setReportForm, handleSubmitReport,
    editForm, setEditForm, handleEditSubmit,
    eligibleUsers, usersLoading,
    sites,
    SCHEDULE_TITLES
}) => {
    return (
        <>
            {/* Add to Schedule Dialog */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent className="max-w-xl" data-testid="schedule-dialog">
                    <DialogHeader>
                        <DialogTitle>Add Ticket to Schedule</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSchedule} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Assign To (Multi-Select)</Label>
                            <MultiStaffCombobox
                                users={eligibleUsers}
                                selectedIds={scheduleForm.user_ids}
                                onChange={(ids) => setScheduleForm({ ...scheduleForm, user_ids: ids })}
                                isLoading={usersLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="schedule-title">Title</Label>
                            <Select
                                value={scheduleForm.title}
                                onValueChange={(value) => setScheduleForm({ ...scheduleForm, title: value })}
                            >
                                <SelectTrigger id="schedule-title" data-testid="schedule-title-select">
                                    <SelectValue placeholder={`Work on: ${ticket.title}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {SCHEDULE_TITLES.map((title) => (
                                        <SelectItem key={title} value={title}>
                                            {title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="schedule-description">Description</Label>
                            <Textarea
                                id="schedule-description"
                                value={scheduleForm.description}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                                data-testid="schedule-description-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="schedule-start">Date</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="schedule-start"
                                    type="text"
                                    placeholder="DD-MM-YYYY HH:mm"
                                    value={scheduleForm.start_date}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^[\d\-\s:]*$/.test(val)) {
                                            const parts = val.split('-');
                                            if (parts[0] && parts[0].length > 2) return;
                                            if (parts[1] && parts[1].length > 2) return;
                                            if (parts[2]) {
                                                const yearTime = parts[2].split(' ');
                                                if (yearTime[0] && yearTime[0].length > 4) return;
                                            }
                                            setScheduleForm({ ...scheduleForm, start_date: val });
                                        }
                                    }}
                                    required
                                    data-testid="schedule-start-input"
                                    className="flex-1"
                                />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[50px] pl-3 text-left font-normal",
                                                !scheduleForm.start_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={(() => {
                                                if (!scheduleForm.start_date) return undefined;
                                                const parts = scheduleForm.start_date.split(' ')[0].split('-');
                                                if (parts.length === 3) {
                                                    const [day, month, year] = parts;
                                                    return new Date(`${year}-${month}-${day}`);
                                                }
                                                return undefined;
                                            })()}
                                            onSelect={(date) => {
                                                if (!date) return;
                                                const currentStr = scheduleForm.start_date || '';
                                                const timePart = currentStr.includes(' ') ? currentStr.split(' ')[1] : moment().format('HH:mm');
                                                const newDateStr = moment(date).format('DD-MM-YYYY');
                                                const finalStr = `${newDateStr} ${timePart || '09:00'}`;
                                                setScheduleForm({ ...scheduleForm, start_date: finalStr });
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gray-600 hover:bg-gray-700" data-testid="create-schedule-submit">
                                Create Schedule
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Submit Report Dialog */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent data-testid="report-dialog">
                    <DialogHeader>
                        <DialogTitle>Submit Report for Ticket</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitReport} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="report-title">Title</Label>
                            <Input
                                id="report-title"
                                value={reportForm.title}
                                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                                required
                                data-testid="report-title-input"
                                placeholder={`Report for: ${ticket.title}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="report-description">Description</Label>
                            <Textarea
                                id="report-description"
                                value={reportForm.description}
                                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                required
                                data-testid="report-description-input"
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="report-file">Upload Document</Label>
                            <Input
                                id="report-file"
                                type="file"
                                onChange={(e) => setReportForm({ ...reportForm, file: e.target.files[0] })}
                                required
                                data-testid="report-file-input"
                                accept=".pdf,.doc,.docx,.xlsx,.xls"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowReportDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-purple-500 hover:bg-purple-600" data-testid="submit-report-form">
                                Submit Report
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Ticket Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl" data-testid="edit-ticket-dialog">
                    <DialogHeader>
                        <DialogTitle>Edit Ticket</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                required
                                data-testid="edit-ticket-title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                required
                                rows={5}
                                data-testid="edit-ticket-description"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-priority">Priority</Label>
                                <Select
                                    value={editForm.priority}
                                    onValueChange={(value) => setEditForm({ ...editForm, priority: value })}
                                >
                                    <SelectTrigger data-testid="edit-ticket-priority">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-division">Assigned To Division</Label>
                                <Select
                                    value={editForm.assigned_to_division}
                                    onValueChange={(value) => setEditForm({ ...editForm, assigned_to_division: value })}
                                >
                                    <SelectTrigger data-testid="edit-ticket-division">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monitoring">Monitoring</SelectItem>
                                        <SelectItem value="Infra">Infra</SelectItem>
                                        <SelectItem value="TS">TS</SelectItem>
                                        <SelectItem value="Internal Support">Internal Support</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-site">Site (Optional)</Label>
                            <SiteCombobox
                                sites={sites}
                                value={editForm.site_id}
                                onChange={(val) => setEditForm({ ...editForm, site_id: val || undefined })}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-primary text-primary-foreground">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
