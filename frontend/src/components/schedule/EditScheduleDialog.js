import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { cn } from '../../lib/utils';
import moment from 'moment';
import { OptimizedStaffCombobox as StaffCombobox, OptimizedSiteCombobox as SiteCombobox } from '../SelectionComponents';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTE_OPTIONS = ['00', '15', '30', '45'];

export const EditScheduleDialog = ({
    editOpen,
    setEditOpen,
    handleUpdate,
    handleDelete,
    editFormData,
    setEditFormData,
    categories,
    isShiftSelected,
    selectedSchedule,
    canModifySchedule,
    users,
    sites
}) => {
    return (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-xl" data-testid="edit-schedule-dialog" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Edit Schedule</DialogTitle>
                    <DialogDescription>Make changes to the schedule here.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Assign To</Label>
                        <StaffCombobox
                            users={users}
                            value={editFormData.user_id}
                            onChange={(val) => setEditFormData({ ...editFormData, user_id: val })}
                            isLoading={users.length === 0}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Select
                            value={editFormData.title}
                            onValueChange={(value) => setEditFormData({ ...editFormData, title: value })}
                        >
                            <SelectTrigger id="edit-title" data-testid="edit-title-select">
                                <SelectValue placeholder="Select title" />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    "Dismantle", "Instalasi Existing - APPS", "Instalasi Existing - Internet Bandwidth",
                                    "Instalasi Existing - WAAS", "Instalasi New - APPS", "Instalasi New - Internet Bandwidth",
                                    "Instalasi New - WAAS", "Maintenance", "Survey - New Client", "Survey - Existing Client",
                                    "Survey - Prospect Client", "Technical Visit", "TM - New", "TM - Existing", "Troubleshoot", "Other"
                                ].map((title) => (
                                    <SelectItem key={title} value={title}>
                                        {title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={editFormData.description}
                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                            data-testid="edit-description-input"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Site *</Label>
                        <SiteCombobox
                            sites={sites}
                            value={editFormData.site_id}
                            onChange={(val) => setEditFormData({ ...editFormData, site_id: val })}
                            isLoading={sites.length === 0}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Start Date & Time</Label>
                            <div className="flex gap-2">
                                <div className="flex flex-1 gap-1">
                                    <Input
                                        type="text"
                                        placeholder="DD-MM-YYYY"
                                        value={editFormData.start_date}
                                        onChange={(e) => {
                                            const dateStr = e.target.value;
                                            if (isShiftSelected) {
                                                const shift = (categories.find(c => c.id === editFormData.category_id)?.name === 'Shift Malam')
                                                    ? { nextDay: true }
                                                    : { nextDay: false };
                                                let endDt = moment(dateStr, 'DD-MM-YYYY');
                                                if (shift.nextDay) endDt = endDt.add(1, 'day');
                                                setEditFormData({ ...editFormData, start_date: dateStr, end_date: endDt.format('DD-MM-YYYY') });
                                            } else {
                                                setEditFormData({ ...editFormData, start_date: dateStr });
                                            }
                                        }}
                                        required
                                        className="flex-1 text-sm h-9"
                                    />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className={cn("px-2 h-9", !editFormData.start_date && "text-muted-foreground")}>
                                                <CalendarIcon className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={editFormData.start_date ? moment(editFormData.start_date, 'DD-MM-YYYY').toDate() : undefined}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    const dateStr = moment(date).format('DD-MM-YYYY');
                                                    if (isShiftSelected) {
                                                        const shift = (categories.find(c => c.id === editFormData.category_id)?.name === 'Shift Malam')
                                                            ? { nextDay: true }
                                                            : { nextDay: false };
                                                        let endDt = moment(date);
                                                        if (shift.nextDay) endDt = endDt.add(1, 'day');
                                                        setEditFormData({ ...editFormData, start_date: dateStr, end_date: endDt.format('DD-MM-YYYY') });
                                                    } else {
                                                        setEditFormData({ ...editFormData, start_date: dateStr });
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex gap-1">
                                    <Select
                                        value={editFormData.start_hour}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, start_hour: val })}
                                        disabled={isShiftSelected}
                                    >
                                        <SelectTrigger className={cn("w-[70px] h-9", isShiftSelected && "bg-slate-800/50 cursor-not-allowed")}>
                                            <SelectValue placeholder="HH" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {HOUR_OPTIONS.map(h => (
                                                <SelectItem key={h} value={h}>{h}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={editFormData.start_minute}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, start_minute: val })}
                                        disabled={isShiftSelected}
                                    >
                                        <SelectTrigger className={cn("w-[70px] h-9", isShiftSelected && "bg-slate-800/50 cursor-not-allowed")}>
                                            <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MINUTE_OPTIONS.map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>End Date & Time</Label>
                            <div className="flex gap-2">
                                <div className="flex flex-1 gap-1">
                                    <Input
                                        type="text"
                                        placeholder="DD-MM-YYYY"
                                        value={editFormData.end_date}
                                        onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                                        readOnly={isShiftSelected}
                                        className={cn("flex-1 text-sm h-9", isShiftSelected && "bg-slate-800/50 cursor-not-allowed")}
                                    />
                                    <Popover>
                                        <PopoverTrigger asChild disabled={isShiftSelected}>
                                            <Button variant="outline" size="sm" className={cn("px-2 h-9", !editFormData.end_date && "text-muted-foreground")} disabled={isShiftSelected}>
                                                <CalendarIcon className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={editFormData.end_date ? moment(editFormData.end_date, 'DD-MM-YYYY').toDate() : undefined}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    setEditFormData({ ...editFormData, end_date: moment(date).format('DD-MM-YYYY') });
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex gap-1">
                                    <Select
                                        value={editFormData.end_hour}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, end_hour: val })}
                                        disabled={isShiftSelected}
                                    >
                                        <SelectTrigger className={cn("w-[70px] h-9", isShiftSelected && "bg-slate-800/50 cursor-not-allowed")}>
                                            <SelectValue placeholder="HH" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {HOUR_OPTIONS.map(h => (
                                                <SelectItem key={h} value={h}>{h}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={editFormData.end_minute}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, end_minute: val })}
                                        disabled={isShiftSelected}
                                    >
                                        <SelectTrigger className={cn("w-[70px] h-9", isShiftSelected && "bg-slate-800/50 cursor-not-allowed")}>
                                            <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MINUTE_OPTIONS.map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-gray-600 hover:bg-gray-700" data-testid="update-schedule-button">
                            Update Schedule
                        </Button>
                    </div>
                </form>
                {selectedSchedule && canModifySchedule(selectedSchedule) && (
                    <div className="pt-4 border-t mt-4 flex justify-end">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(selectedSchedule.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Schedule
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
