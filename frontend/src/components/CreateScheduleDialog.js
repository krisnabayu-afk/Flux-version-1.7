import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon, Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { cn } from '../lib/utils';
import { OptimizedMultiStaffCombobox, OptimizedSiteCombobox } from './SelectionComponents';

const API = `${process.env.REACT_APP_API_URL}/api`;

const SCHEDULE_TITLES = [
    "Dismantle", "Instalasi Existing - APPS", "Instalasi Existing - Internet Bandwidth",
    "Instalasi Existing - WAAS", "Instalasi New - APPS", "Instalasi New - Internet Bandwidth",
    "Instalasi New - WAAS", "Maintenance", "Survey - New Client", "Survey - Existing Client",
    "Survey - Prospect Client", "Technical Visit", "TM - New", "TM - Existing", "Troubleshoot", "Other"
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTE_OPTIONS = ['00', '15', '30', '45'];

const CreateScheduleDialog = ({
    user, users, sites, categories,
    onScheduleCreated, openedFromSummary, setOpenedFromSummary,
    setDailySummaryOpen, open, onOpenChange, selectedDate
}) => {
    const [formData, setFormData] = useState({
        user_ids: [],
        division: '',
        category_id: '',
        title: '',
        description: '',
        start_date: '',
        start_hour: '09',
        start_minute: '00',
        end_date: '',
        end_hour: '18',
        end_minute: '00',
        site_id: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && selectedDate) {
            setFormData(prev => ({
                ...prev,
                start_date: moment(selectedDate).format('DD-MM-YYYY'),
                start_hour: '09',
                start_minute: '00',
                end_date: moment(selectedDate).format('DD-MM-YYYY'),
                end_hour: '18',
                end_minute: '00'
            }));
        }
    }, [open, selectedDate]);

    // Memoize eligible users within the dialog to further isolate
    const eligibleUsers = useMemo(() => {
        if (!user || !users) return [];
        return users.filter(u => {
            if (user.role === 'SuperUser') return true;

            const uDept = u.department || (['Monitoring', 'Infra', 'TS', 'Apps', 'Fiberzone', 'Admin', 'Internal Support'].includes(u.division) ? 'Technical Operation' : null);

            // Admin Division: Can assign anyone in the same department
            if (user.division === 'Admin') {
                return uDept === user.department;
            }

            // Scoped VP: restricted to their department if set
            if (user.role === 'VP') {
                if (user.department) return uDept === user.department;
                return true;
            }

            // Normal Manager/SPV constraints
            if (user.region && u.region && user.region !== u.region) return false;

            if (u.division === user.division) return true;
            if (user.division === 'TS' && u.division === 'Apps') return true;
            if (user.division === 'Infra' && u.division === 'Fiberzone') return true;
            return false;
        });
    }, [users, user]);

    const isMonitoringSelected = useMemo(() => {
        return users.filter(u => formData.user_ids.includes(u.id)).some(u => u.division === 'Monitoring');
    }, [users, formData.user_ids]);

    const filteredCategories = useMemo(() => {
        if (isMonitoringSelected) {
            return categories.filter(cat => ['Shift Pagi', 'Shift Siang', 'Shift Malam'].includes(cat.name));
        }
        return categories;
    }, [categories, isMonitoringSelected]);

    // Auto-fill logic for Monitoring shifts
    useEffect(() => {
        if (isMonitoringSelected && formData.category_id) {
            const selectedCat = categories.find(c => c.id === formData.category_id);
            if (selectedCat && ['Shift Pagi', 'Shift Siang', 'Shift Malam'].includes(selectedCat.name)) {
                const shiftName = selectedCat.name;
                const shifts = {
                    'Shift Pagi': { start: '07:00', end: '16:00', nextDay: false },
                    'Shift Siang': { start: '13:00', end: '22:00', nextDay: false },
                    'Shift Malam': { start: '22:00', end: '07:00', nextDay: true },
                };

                const shift = shifts[shiftName];
                const datePart = formData.start_date || moment().format('DD-MM-YYYY');

                let endDt = moment(datePart, 'DD-MM-YYYY');
                if (shift.nextDay) {
                    endDt = endDt.add(1, 'day');
                }
                const endStr = endDt.format('DD-MM-YYYY');

                setFormData(prev => ({
                    ...prev,
                    start_date: datePart,
                    start_hour: shift.start.split(':')[0],
                    start_minute: shift.start.split(':')[1],
                    end_date: endStr,
                    end_hour: shift.end.split(':')[0],
                    end_minute: shift.end.split(':')[1],
                    title: shiftName
                }));
            }
        }
    }, [formData.category_id, isMonitoringSelected, categories, formData.start_date]);

    const isShiftSelected = useMemo(() => {
        if (!isMonitoringSelected || !formData.category_id) return false;
        const cat = categories.find(c => c.id === formData.category_id);
        return cat && ['Shift Pagi', 'Shift Siang', 'Shift Malam'].includes(cat.name);
    }, [isMonitoringSelected, formData.category_id, categories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.user_ids.length === 0) {
            toast.error('Please select at least one staff member');
            return;
        }
        if (!formData.site_id) {
            toast.error('Please select a site');
            return;
        }

        try {
            // Format dates back to YYYY-MM-DD HH:mm for the backend
            const formattedData = {
                ...formData,
                start_date: moment(`${formData.start_date} ${formData.start_hour}:${formData.start_minute}`, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm'),
                end_date: moment(`${formData.end_date} ${formData.end_hour}:${formData.end_minute}`, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm')
            };
            delete formattedData.start_hour;
            delete formattedData.start_minute;
            delete formattedData.end_hour;
            delete formattedData.end_minute;
            const response = await axios.post(`${API}/schedules`, formattedData);
            toast.success(response.data.message);
            setFormData({
                user_ids: [], division: '', category_id: '',
                title: '', description: '', start_date: '', start_hour: '09', start_minute: '00', end_date: '', end_hour: '18', end_minute: '00', site_id: ''
            });
            onOpenChange(false);
            if (onScheduleCreated) onScheduleCreated();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create schedule');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto w-full" data-testid="schedule-dialog">
                <DialogHeader>
                    <DialogTitle>Create New Schedule</DialogTitle>
                    <DialogDescription>Fill in the details to create a new schedule.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Assign To (Multi-Select)</Label>
                        <OptimizedMultiStaffCombobox
                            users={eligibleUsers}
                            selectedIds={formData.user_ids}
                            onChange={(ids) => setFormData({ ...formData, user_ids: ids })}
                            isLoading={users.length === 0}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Activity Category *</Label>
                        <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                            <SelectTrigger data-testid="category-select">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isShiftSelected && (
                            <div className="text-xs font-medium text-blue-500 flex items-center gap-1 mt-1">
                                <Check size={12} /> Standard Shift Applied
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
                            <SelectTrigger id="title" data-testid="title-select">
                                <SelectValue placeholder="Select title" />
                            </SelectTrigger>
                            <SelectContent>
                                {SCHEDULE_TITLES.map((title) => (
                                    <SelectItem key={title} value={title} disabled={isShiftSelected}>{title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            data-testid="description-input"
                            placeholder="Contoh: Troubleshoot - Site Visit - *Nama Site."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Site *</Label>
                        <OptimizedSiteCombobox
                            sites={sites}
                            value={formData.site_id}
                            onChange={(val) => setFormData({ ...formData, site_id: val })}
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
                                        value={formData.start_date}
                                        onChange={(e) => {
                                            const dateStr = e.target.value;
                                            if (isShiftSelected) {
                                                const shift = (categories.find(c => c.id === formData.category_id)?.name === 'Shift Malam')
                                                    ? { nextDay: true }
                                                    : { nextDay: false };
                                                let endDt = moment(dateStr, 'DD-MM-YYYY');
                                                if (shift.nextDay) endDt = endDt.add(1, 'day');
                                                setFormData({ ...formData, start_date: dateStr, end_date: endDt.format('DD-MM-YYYY') });
                                            } else {
                                                setFormData({ ...formData, start_date: dateStr });
                                            }
                                        }}
                                        required
                                        className="flex-1 text-sm h-9"
                                    />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className={cn("px-2 h-9", !formData.start_date && "text-muted-foreground")}>
                                                <CalendarIcon className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={formData.start_date ? moment(formData.start_date, 'DD-MM-YYYY').toDate() : undefined}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    const dateStr = moment(date).format('DD-MM-YYYY');
                                                    if (isShiftSelected) {
                                                        const shift = (categories.find(c => c.id === formData.category_id)?.name === 'Shift Malam')
                                                            ? { nextDay: true }
                                                            : { nextDay: false };
                                                        let endDt = moment(date);
                                                        if (shift.nextDay) endDt = endDt.add(1, 'day');
                                                        setFormData({ ...formData, start_date: dateStr, end_date: endDt.format('DD-MM-YYYY') });
                                                    } else {
                                                        setFormData({ ...formData, start_date: dateStr });
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex gap-1">
                                    <Select
                                        value={formData.start_hour}
                                        onValueChange={(val) => setFormData({ ...formData, start_hour: val })}
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
                                        value={formData.start_minute}
                                        onValueChange={(val) => setFormData({ ...formData, start_minute: val })}
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
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        readOnly={isShiftSelected}
                                        className={cn("flex-1 text-sm h-9", isShiftSelected && "bg-slate-800/50 cursor-not-allowed")}
                                    />
                                    <Popover>
                                        <PopoverTrigger asChild disabled={isShiftSelected}>
                                            <Button variant="outline" size="sm" className={cn("px-2 h-9", !formData.end_date && "text-muted-foreground")} disabled={isShiftSelected}>
                                                <CalendarIcon className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={formData.end_date ? moment(formData.end_date, 'DD-MM-YYYY').toDate() : undefined}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    setFormData({ ...formData, end_date: moment(date).format('DD-MM-YYYY') });
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex gap-1">
                                    <Select
                                        value={formData.end_hour}
                                        onValueChange={(val) => setFormData({ ...formData, end_hour: val })}
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
                                        value={formData.end_minute}
                                        onValueChange={(val) => setFormData({ ...formData, end_minute: val })}
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-gray-600 hover:bg-gray-700">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Schedule
                        </Button>
                    </div>
                </form >
            </DialogContent >
        </Dialog >
    );
};

export default CreateScheduleDialog;
