import { useEffect, useState, useMemo, memo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, Upload, Download, Calendar as CalendarIcon, Edit, Trash2, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Play, Pause, MessageSquare, Check, ChevronsUpDown, MapPin, FileText } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import CreateScheduleDialog from '../components/CreateScheduleDialog';
import {
  OptimizedMultiStaffCombobox as MultiStaffCombobox,
  OptimizedStaffCombobox as StaffCombobox,
  OptimizedSiteCombobox as SiteCombobox
} from '../components/SelectionComponents';
import { InvertedWeekView, InvertedDayView } from '../components/InvertedCalendarViews';
import { CustomToolbar } from '../components/schedule/CustomToolbar';
import { BulkUploadDialog } from '../components/schedule/BulkUploadDialog';
import { EditScheduleDialog } from '../components/schedule/EditScheduleDialog';
import { DailySummaryDialog } from '../components/schedule/DailySummaryDialog';
import { HolidayManagementDialog } from '../components/schedule/HolidayManagementDialog';
import { HolidayFormDialog } from '../components/schedule/HolidayFormDialog';

const localizer = momentLocalizer(moment);
const API = `${process.env.REACT_APP_API_URL}/api`;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTE_OPTIONS = ['00', '15', '30', '45'];

// Custom Calendar Toolbar with clickable month/year

// Shared components removed and replaced by SelectionComponents.js

const Schedule = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]); // NEW: Sites state
  const [categories, setCategories] = useState([]); // NEW: Activity categories
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null); // For editing
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [filterUserId, setFilterUserId] = useState('all'); // NEW: Staff filter state
  const [filterDivision, setFilterDivision] = useState('all'); // NEW: Division filter state
  const [filterRegion, setFilterRegion] = useState('all'); // REGIONAL: Region filter state

  const [dailySummaryOpen, setDailySummaryOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openedFromSummary, setOpenedFromSummary] = useState(false); // NEW: Track origin
  const [morningBriefingUrl, setMorningBriefingUrl] = useState(null); // NEW: Morning Briefing URL
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Holiday State
  const [holidays, setHolidays] = useState([]);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [holidayFormOpen, setHolidayFormOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [holidayFormData, setHolidayFormData] = useState({
    start_date: '',
    end_date: '',
    description: '',
    is_recurring: false
  });

  // FormData moved to CreateScheduleDialog.js for creation
  // Re-adding small part of formData for EDITING purposes
  const [editFormData, setEditFormData] = useState({
    user_id: '',
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
  const [uploadFile, setUploadFile] = useState(null);

  // Activity Detail State
  const [activityDetailOpen, setActivityDetailOpen] = useState(false);
  const [selectedScheduleForActivity, setSelectedScheduleForActivity] = useState(null); // To hold the schedule for which activity is being viewed
  const [activityData, setActivityData] = useState(null); // To hold the fetched activity data

  const [loadingActivity, setLoadingActivity] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // NEW: Image preview state

  // PHASE 2: SPV can also edit/delete
  const canEdit = user?.role === 'VP' || user?.role === 'Manager' || user?.role === 'SPV' || user?.role === 'SuperUser';

  const isHolidayAdmin = useMemo(() => {
    if (!user) return false;
    if (user.role === 'SuperUser') return true;
    if (user.department !== 'Technical Operation') return false;
    return user.division === 'Admin' || user.role === 'VP';
  }, [user]);

  useEffect(() => {
    fetchSchedules();
    fetchUsers();
    fetchSites(); // NEW: Fetch sites
    fetchCategories(); // NEW: Fetch categories
    fetchHolidays(); // NEW: Fetch holidays
  }, []);

  // OPTIMIZATION: Memoize filtered users to avoid re-filtering on every render
  const eligibleUsers = useMemo(() => {
    if (!user) return [];
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

  // SCHEDULE_TITLES moved to CreateScheduleDialog.js or shared if needed
  // Removing from here to avoid redundancy


  // Handle deep linking from notifications
  useEffect(() => {
    if (location.state?.openScheduleId && schedules.length > 0) {
      const scheduleId = location.state.openScheduleId;
      const schedule = schedules.find(s => s.id === scheduleId);

      if (schedule) {
        // Navigate to the date of the schedule
        const newDate = new Date(schedule.start_date);
        setDate(newDate);
        // Optional: Switch to day view or agenda view to make it easier to see?
        // setView('day'); 

        // Show the summary/details for this day
        showDailySummary(newDate);

        // Clear state to avoid reopening on refresh (optional, but good practice)
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, schedules]);

  // NEW: Fetch Morning Briefing when viewing daily summary
  useEffect(() => {
    if (dailySummaryOpen && selectedDate) {
      fetchMorningBriefing(selectedDate);
    } else {
      setMorningBriefingUrl(null);
    }
  }, [dailySummaryOpen, selectedDate]);

  const fetchMorningBriefing = async (date) => {
    try {
      const dateStr = moment(date).format('YYYY-MM-DD');
      const response = await axios.get(`${API}/morning-briefing/${dateStr}`);
      setMorningBriefingUrl(response.data.url);
    } catch (error) {
      setMorningBriefingUrl(null);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API}/schedules`);
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchSites = async () => {
    try {
      // Request all sites by using a high limit (no pagination needed for dropdown)
      const response = await axios.get(`${API}/sites`, {
        params: {
          limit: 9999 // Get all sites for dropdown
        }
      });
      // Handle paginated response structure (same as Sites.js)
      if (response.data.items) {
        setSites(Array.isArray(response.data.items) ? response.data.items : []);
      } else {
        // Fallback for non-paginated response
        setSites(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error);
      setSites([]); // Ensure sites is always an array
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/activity-categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await axios.get(`${API}/holidays`);
      setHolidays(response.data);
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    }
  };
  // NEW: Apply staff, division and region filter
  const filteredSchedules = schedules.filter(s => {
    if (filterUserId && filterUserId !== 'all' && s.user_id !== filterUserId) return false;
    if (filterDivision && filterDivision !== 'all' && s.division !== filterDivision) return false;
    // REGIONAL: Add region filter
    if (filterRegion && filterRegion !== 'all' && s.site_region !== filterRegion) return false;
    return true;
  });

  const currentDailySchedules = useMemo(() => {
    if (!selectedDate) return [];
    const selectedDay = moment(selectedDate).startOf('day');
    return filteredSchedules.filter(schedule => {
      const scheduleStart = moment(schedule.start_date).startOf('day');
      const scheduleEnd = schedule.end_date ? moment(schedule.end_date).startOf('day') : scheduleStart;
      return selectedDay.isBetween(scheduleStart, scheduleEnd, null, '[]');
    });
  }, [selectedDate, filteredSchedules]);

  const currentHoliday = useMemo(() => {
    if (!selectedDate || holidays.length === 0) return null;
    const selectedDay = moment(selectedDate).startOf('day');
    return holidays.find(h => {
      const start = moment(h.start_date).startOf('day');
      const end = moment(h.end_date || h.start_date).endOf('day');
      return selectedDay.isBetween(start, end, null, '[]');
    });
  }, [selectedDate, holidays]);

  const events = filteredSchedules.map(schedule => ({
    id: schedule.id,
    title: schedule.site_name ? `${schedule.site_name} - ${schedule.title}` : schedule.title,
    start: new Date(schedule.start_date),
    end: schedule.end_date ? new Date(schedule.end_date) : new Date(schedule.start_date),
    resource: schedule
  }));

  const handleSelectSlot = ({ start, action }) => {
    // PHASE 2: Show daily summary for all users (including Staff)
    showDailySummary(start);
  };

  const showDailySummary = (date) => {
    setSelectedDate(date);
    setDailySummaryOpen(true);
  };

  // handleUserSelect removed - now handled directly in combobox onChange

  // handleSubmit removed - handled by CreateScheduleDialog.js

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    const startDt = moment(schedule.start_date);
    const endDt = schedule.end_date ? moment(schedule.end_date) : moment(schedule.start_date).endOf('day');

    setEditFormData({
      user_id: schedule.user_id,
      user_name: schedule.user_name,
      division: schedule.division,
      category_id: schedule.category_id || '',
      title: schedule.title,
      description: schedule.description || '',
      start_date: startDt.format('DD-MM-YYYY'),
      start_hour: startDt.format('HH'),
      start_minute: startDt.format('mm'),
      end_date: endDt.format('DD-MM-YYYY'),
      end_hour: endDt.format('HH'),
      end_minute: endDt.format('mm'),
      site_id: schedule.site_id || ''
    });
    setEditOpen(true);
  };

  const isShiftSelected = useMemo(() => {
    if (!selectedSchedule || !editFormData.category_id) return false;
    if (selectedSchedule.division !== 'Monitoring') return false;
    const cat = categories.find(c => c.id === editFormData.category_id);
    return cat && ['Shift Pagi', 'Shift Siang', 'Shift Malam'].includes(cat.name);
  }, [selectedSchedule, editFormData.category_id, categories]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      // Format dates back to YYYY-MM-DD HH:mm for the backend
      const payload = {
        ...editFormData,
        start_date: moment(`${editFormData.start_date} ${editFormData.start_hour}:${editFormData.start_minute}`, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm'),
        end_date: moment(`${editFormData.end_date} ${editFormData.end_hour}:${editFormData.end_minute}`, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm')
      };
      delete payload.start_hour;
      delete payload.start_minute;
      delete payload.end_hour;
      delete payload.end_minute;

      await axios.put(`${API}/schedules/${selectedSchedule.id}`, payload);
      toast.success('Schedule updated successfully!');
      setEditOpen(false);
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update schedule');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await axios.delete(`${API}/schedules/${scheduleId}`);
      toast.success('Schedule deleted successfully!');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete schedule');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await axios.post(`${API}/schedules/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(response.data.message);
      if (response.data.errors && response.data.errors.length > 0) {
        console.error('Upload errors:', response.data.errors);
        toast.warning(`${response.data.errors.length} rows had errors. Check console for details.`);
      }
      setBulkUploadOpen(false);
      setUploadFile(null);
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload schedules');
    }
  };

  const handleScheduleClick = async (schedule) => {
    setActivityDetailOpen(true);
    setLoadingActivity(true);
    setSelectedScheduleForActivity(schedule); // Set the schedule first
    setActivityData(null); // Reset previous activity data

    try {
      // Fetch activity details using the public endpoint
      const response = await axios.get(`${API}/activities/schedule/${schedule.id}`);
      setActivityData(response.data || null);
    } catch (error) {
      console.error('Failed to fetch activity details:', error);
      setActivityData(null); // No activity data found
    } finally {
      setLoadingActivity(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-slate-200 text-slate-700', icon: Clock },
      'In Progress': { color: 'bg-gray-700/50 text-gray-200', icon: Play },
      'Finished': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'Cancelled': { color: 'bg-red-100 text-red-700', icon: XCircle },
      'On Hold': { color: 'bg-yellow-100 text-yellow-700', icon: Pause }
    };
    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center space-x-1 w-fit`}>
        <Icon size={12} />
        <span>{status}</span>
      </Badge>
    );
  };

  const downloadTemplate = () => {
    const csv = 'user_email,title,description,start_date,end_date\\nstaff@example.com,Night Shift,Night shift duties,2026-03-01 22:00,2026-03-02 06:00';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule_template.csv';
    a.click();
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const eventStyleGetter = (event) => {
    const colors = {
      'Infra': { backgroundColor: '#eab308', borderColor: '#ca8a04' }, // Yellow
      'TS': { backgroundColor: '#ec4899', borderColor: '#db2777' }, // Pink
      'Apps': { backgroundColor: '#ef4444', borderColor: '#dc2626' }, // Red
      'Fiberzone': { backgroundColor: '#22c55e', borderColor: '#16a34a' }, // Green
      'Monitoring': { backgroundColor: '#3b82f6', borderColor: '#2563eb' }, // Blue
      'Internal Support': { backgroundColor: '#06b6d4', borderColor: '#0891b2' } // Cyan
    };

    const divisionColor = colors[event.resource.division] || { backgroundColor: '#6b7280', borderColor: '#4b5563' };

    return {
      style: {
        ...divisionColor,
        borderRadius: '6px',
        border: 'none',
        color: 'white',
        padding: '4px 8px',
        cursor: 'pointer'
      }
    };
  };

  const dayPropGetter = (date) => {
    const holiday = holidays.find(h => {
      const start = moment(h.start_date).startOf('day');
      const end = moment(h.end_date || h.start_date).endOf('day');
      return moment(date).isBetween(start, end, null, '[]');
    });
    if (holiday) {
      return {
        className: 'bg-red-500/10 border-red-500/20',
        style: {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }
      };
    }
    return {};
  };

  const handleHolidaySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        await axios.put(`${API}/holidays/${editingHoliday.id}`, holidayFormData);
        toast.success('Holiday updated successfully');
      } else {
        await axios.post(`${API}/holidays`, holidayFormData);
        toast.success('Holiday added successfully');
      }
      setHolidayFormOpen(false);
      fetchHolidays();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await axios.delete(`${API}/holidays/${id}`);
      toast.success('Holiday deleted successfully');
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to delete holiday');
    }
  };

  // PHASE 2: Check if user can edit/delete specific schedule
  const canModifySchedule = (schedule) => {
    // Grant access if user is the creator
    if (user && schedule.created_by === user.id) return true;

    if (!canEdit) return false;
    if (user.role === 'VP') return true;
    return schedule.division === user.division;
  };

  const handleAddScheduleFromSummary = () => {
    setDailySummaryOpen(false);
    setOpenedFromSummary(true);
    setOpen(true);
  };

  return (
    <div className="space-y-6" data-testid="schedule-page">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Schedule</h1>
          <p className="text-muted-foreground">
            {canEdit ? 'Manage team schedules' : 'View team schedules'}
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {canEdit && (
            <>
              <BulkUploadDialog
                bulkUploadOpen={bulkUploadOpen} setBulkUploadOpen={setBulkUploadOpen}
                handleBulkUpload={handleBulkUpload} setUploadFile={setUploadFile}
                downloadTemplate={downloadTemplate}
              />

              {isHolidayAdmin && (
                <Button
                  onClick={() => setHolidayDialogOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  data-testid="manage-holidays-button"
                >
                  <CalendarIcon size={18} className="mr-2" />
                  Manage Holidays
                </Button>
              )}

              <Button
                onClick={() => {
                  setOpenedFromSummary(false);
                  setOpen(true);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white"
                data-testid="create-schedule-button"
              >
                <Plus size={18} className="mr-2" />
                Create Schedule
              </Button>

              <CreateScheduleDialog
                open={open}
                onOpenChange={setOpen}
                user={user}
                users={users}
                sites={sites}
                categories={categories}
                onScheduleCreated={fetchSchedules}
                openedFromSummary={openedFromSummary}
                setOpenedFromSummary={setOpenedFromSummary}
                setDailySummaryOpen={setDailySummaryOpen}
                selectedDate={selectedDate}
              />
            </>
          )}
        </div>
      </div>

      {/* Minimalist Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-[250px]">
            <StaffCombobox
              users={users}
              value={filterUserId}
              onChange={setFilterUserId}
              isLoading={users.length === 0}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={filterDivision} onValueChange={setFilterDivision}>
              <SelectTrigger className="w-full bg-transparent border-slate-700 hover:bg-slate-800/50" data-testid="division-filter">
                <SelectValue placeholder="All Divisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                <SelectItem value="Infra">Infra</SelectItem>
                <SelectItem value="Fiberzone">Fiberzone</SelectItem>
                <SelectItem value="TS">TS</SelectItem>
                <SelectItem value="Apps">Apps</SelectItem>
                <SelectItem value="Monitoring">Monitoring</SelectItem>
                <SelectItem value="Internal Support">Internal Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* REGIONAL: Region Filter */}
          <div className="w-full md:w-[180px]">
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-full bg-transparent border-slate-700 hover:bg-slate-800/50" data-testid="region-filter">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Region 1">Region 1</SelectItem>
                <SelectItem value="Region 2">Region 2</SelectItem>
                <SelectItem value="Region 3">Region 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-muted-foreground">Divisions:</span>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-foreground">Infra</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span className="text-sm text-foreground">TS</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-foreground">Apps</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-foreground">Fiberzone</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Column */}
        <div className="w-full lg:w-[65%] xl:w-[70%]">
          <div className="bg-slate-900/50 rounded-xl p-6 shadow-lg border border-slate-700" data-testid="calendar-view">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 700 }}
              selectable
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              view={view}
              onView={setView}
              date={date}
              onNavigate={handleNavigate}
              onDrillDown={showDailySummary} // Restore daily summary on date click
              onSelectEvent={(event) => handleScheduleClick(event.resource)}
              views={{ month: true, week: InvertedWeekView, day: InvertedDayView }}
              components={{
                toolbar: CustomToolbar
              }}
            />
          </div>
        </div>

        {/* Today's Schedule Column */}
        <div className="w-full lg:w-[35%] xl:w-[30%]">
          <div className="bg-card rounded-xl p-6 shadow-lg border border-border flex flex-col h-[748px]">
            <h2 className="text-xl font-bold text-foreground mb-4 sticky top-0 bg-card z-10 pb-2">
              Today's Schedules
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({moment().format('MMMM DD, YYYY')})
              </span>
            </h2>
            <div className="space-y-3 overflow-y-auto flex-1 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {(() => {
                // Filter for today's schedules
                const today = moment().startOf('day');
                const todaySchedules = filteredSchedules.filter(schedule => {
                  const scheduleStart = moment(schedule.start_date).startOf('day');
                  const scheduleEnd = schedule.end_date ? moment(schedule.end_date).startOf('day') : scheduleStart;
                  return today.isBetween(scheduleStart, scheduleEnd, null, '[]');
                });

                if (todaySchedules.length === 0) {
                  return (
                    <p className="text-muted-foreground text-center py-8">
                      No schedules for today
                    </p>
                  );
                }

                return todaySchedules.map(schedule => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {schedule.title}{schedule.site_name ? ` - ${schedule.site_name}` : ''}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {schedule.user_name} ({schedule.division})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {moment(schedule.start_date).format('MMM DD, YYYY HH:mm')}
                      </p>
                    </div>
                    {/* PHASE 2: Edit and Delete buttons for Manager/SPV (division restricted) */}
                    {canModifySchedule(schedule) && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                          className="text-gray-400 border-gray-500 hover:bg-gray-800"
                          data-testid={`edit-schedule-${schedule.id}`}
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-400 border-red-400 hover:bg-red-900/20"
                          data-testid={`delete-schedule-${schedule.id}`}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Schedule Dialog */}
      <EditScheduleDialog
        editOpen={editOpen} setEditOpen={setEditOpen}
        handleUpdate={handleUpdate} handleDelete={handleDelete}
        editFormData={editFormData} setEditFormData={setEditFormData}
        categories={categories} isShiftSelected={isShiftSelected}
        selectedSchedule={selectedSchedule} canModifySchedule={canModifySchedule}
        users={users} sites={sites}
      />

      {/* Daily Summary Dialog */}
      <DailySummaryDialog
        dailySummaryOpen={dailySummaryOpen} setDailySummaryOpen={setDailySummaryOpen}
        selectedDate={selectedDate} currentHoliday={currentHoliday}
        morningBriefingUrl={morningBriefingUrl} setShowPdfPreview={setShowPdfPreview}
        currentDailySchedules={currentDailySchedules} getStatusBadge={getStatusBadge}
        eventStyleGetter={eventStyleGetter} handleEdit={handleEdit}
        handleDelete={handleDelete} canModifySchedule={canModifySchedule}
        handleScheduleClick={handleScheduleClick} canEdit={canEdit}
        handleAddScheduleFromSummary={handleAddScheduleFromSummary}
        users={users}
      />

      {/* Holiday Management Dialog */}
      <HolidayManagementDialog
        holidayDialogOpen={holidayDialogOpen} setHolidayDialogOpen={setHolidayDialogOpen}
        holidays={holidays} setEditingHoliday={setEditingHoliday}
        setHolidayFormData={setHolidayFormData} setHolidayFormOpen={setHolidayFormOpen}
        handleDeleteHoliday={handleDeleteHoliday}
      />

      {/* Holiday Add/Edit Form Dialog */}
      <HolidayFormDialog
        holidayFormOpen={holidayFormOpen} setHolidayFormOpen={setHolidayFormOpen}
        editingHoliday={editingHoliday} handleHolidaySubmit={handleHolidaySubmit}
        holidayFormData={holidayFormData} setHolidayFormData={setHolidayFormData}
      />

      {/* Activity Detail Dialog */}
      <Dialog open={activityDetailOpen} onOpenChange={setActivityDetailOpen}>
        <DialogContent className="max-w-md" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
            <DialogDescription>Current status and progress updates.</DialogDescription>
          </DialogHeader>

          {selectedScheduleForActivity && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary rounded-lg border border-border">
                <h3 className="font-semibold text-lg text-foreground">{selectedScheduleForActivity.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{selectedScheduleForActivity.user_name} ({selectedScheduleForActivity.division})</p>
                {activityData ? getStatusBadge(activityData.status) : getStatusBadge('Pending')}
              </div>

              {loadingActivity ? (
                <div className="text-center py-4 text-muted-foreground">Loading activity details...</div>
              ) : activityData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-muted-foreground block">Start Time</span>
                      <div className="flex items-center">
                        <span className="text-foreground">{activityData.start_time ? moment(activityData.start_time).format('HH:mm') : '-'}</span>
                        {activityData.start_lat && activityData.start_lng && (
                          <a
                            href={`https://www.google.com/maps?q=${activityData.start_lat},${activityData.start_lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center text-gray-400 hover:text-gray-300"
                            title="View Start Location"
                          >
                            <MapPin size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground block">Finish Time</span>
                      <div className="flex items-center">
                        <span className="text-foreground">{activityData.finish_time ? moment(activityData.finish_time).format('HH:mm') : '-'}</span>
                        {activityData.finish_lat && activityData.finish_lng && (
                          <a
                            href={`https://www.google.com/maps?q=${activityData.finish_lat},${activityData.finish_lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center text-gray-400 hover:text-gray-300"
                            title="View Finish Location"
                          >
                            <MapPin size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>



                  {activityData.progress_updates && activityData.progress_updates.length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center">
                        <MessageSquare size={14} className="mr-1" /> Progress Updates
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {activityData.progress_updates.map((update, idx) => (
                          <div key={idx} className="text-sm bg-secondary/50 border border-border p-2 rounded shadow-sm">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <span>{update.update_text}</span>
                                {update.image_url || update.image_data ? (
                                  <div className="mt-2">
                                    <img
                                      src={update.image_url
                                        ? `${process.env.REACT_APP_API_URL}${update.image_url}`
                                        : `data:image/jpeg;base64,${update.image_data}`}
                                      alt="Update attachment"
                                      className="max-h-40 rounded border border-slate-200 cursor-pointer hover:opacity-90"
                                      onClick={() => setPreviewImage(
                                        update.image_url
                                          ? `${process.env.REACT_APP_API_URL}${update.image_url}`
                                          : `data:image/jpeg;base64,${update.image_data}`
                                      )}
                                    />
                                  </div>
                                ) : null}
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 flex flex-col items-end">
                                <span>{moment(update.timestamp).format('HH:mm')}</span>
                                {update.latitude && update.longitude && (
                                  <a
                                    href={`https://www.google.com/maps?q=${update.latitude},${update.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-muted-foreground hover:text-foreground mt-1"
                                    title="View Location"
                                  >
                                    <MapPin size={10} className="mr-0.5" />
                                    <span className="text-[10px]">Map</span>
                                  </a>
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground italic">
                  No activity recorded yet.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none [&>button]:hidden" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="relative flex justify-center items-center h-full">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-background/50 text-foreground p-2 rounded-full hover:bg-background/80 transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Modal */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-1" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="px-4 py-2 border-b">
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="text-blue-500" size={20} />
              <span>Morning Briefing Preview</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-slate-100 rounded-b-lg overflow-hidden">
            {morningBriefingUrl ? (
              <iframe
                src={`${process.env.REACT_APP_API_URL}${morningBriefingUrl}#toolbar=0`}
                className="w-full h-full border-none"
                title="Morning Briefing PDF"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 italic">
                No preview available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default Schedule;
