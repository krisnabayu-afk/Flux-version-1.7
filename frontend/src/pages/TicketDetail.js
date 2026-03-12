import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import moment from 'moment';

// Modular Components
import { TicketHeader } from '../components/ticket-detail/TicketHeader';
import { TicketDetailsCard } from '../components/ticket-detail/TicketDetailsCard';
import { LinkedReportCard } from '../components/ticket-detail/LinkedReportCard';
import { CommentsSection } from '../components/ticket-detail/CommentsSection';
import { TicketActions } from '../components/ticket-detail/TicketActions';
import { TicketDialogs } from '../components/ticket-detail/TicketDialogs';

const API = `${process.env.REACT_APP_API_URL}/api`;

const SCHEDULE_TITLES = [
  "Dismantle",
  "Instalasi Existing - APPS",
  "Instalasi Existing - Internet Bandwidth",
  "Instalasi Existing - WAAS",
  "Instalasi New - APPS",
  "Instalasi New - Internet Bandwidth",
  "Instalasi New - WAAS",
  "Maintenance",
  "Survey - New Client",
  "Survey - Existing Client",
  "Survey - Prospect Client",
  "Technical Visit",
  "TM - New",
  "TM - Existing",
  "Troubleshoot",
  "Other"
];

const TicketDetail = () => {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [linkedReport, setLinkedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const [scheduleForm, setScheduleForm] = useState({
    user_ids: [],
    division: '',
    title: '',
    description: '',
    start_date: moment().format('DD-MM-YYYY HH:mm'),
    ticket_id: ticketId,
    site_id: ''
  });

  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    file: null
  });

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: '',
    assigned_to_division: '',
    site_id: undefined
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTicket(), fetchUsers(), fetchSites()]);
      setLoading(false);
    };
    init();
  }, [ticketId]);

  const eligibleUsers = useMemo(() => {
    if (!user || !ticket) return [];
    return users.filter(u => {
      if (user.role === 'VP' || user.role === 'SuperUser') return true;
      if (user.region && u.region && user.region !== u.region) return false;
      if (u.division === ticket.assigned_to_division) return true;
      if (ticket.assigned_to_division === 'TS' && u.division === 'Apps') return true;
      if (ticket.assigned_to_division === 'Infra' && u.division === 'Fiberzone') return true;
      return false;
    });
  }, [users, user, ticket]);

  const fetchTicket = async () => {
    try {
      const response = await axios.get(`${API}/tickets/${ticketId}`);
      setTicket(response.data);
      if (response.data.linked_report_id) {
        try {
          const reportRes = await axios.get(`${API}/reports/${response.data.linked_report_id}`);
          setLinkedReport(reportRes.data);
        } catch (reportError) {
          console.error('Failed to fetch linked report:', reportError);
          if (reportError.response?.status === 404) {
            toast.error('Linked report not found');
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load ticket');
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
      const response = await axios.get(`${API}/sites`, { params: { limit: 1000 } });
      setSites(response.data.items || response.data);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await axios.post(`${API}/tickets/${ticketId}/comments`, { ticket_id: ticketId, comment });
      toast.success('Comment added');
      setComment('');
      fetchTicket();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      const dateParts = scheduleForm.start_date.split(' ');
      const dateStr = dateParts[0];
      const timeStr = dateParts[1] || '09:00';
      const [day, month, year] = dateStr.split('-');
      const isoDate = `${year}-${month}-${day}T${timeStr}`;

      await axios.post(`${API}/schedules`, { ...scheduleForm, start_date: isoDate });
      toast.success('Schedule created!');
      setShowScheduleDialog(false);
      setScheduleForm(prev => ({ ...prev, user_ids: [], title: '', description: '', start_date: moment().format('DD-MM-YYYY HH:mm') }));
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create schedule');
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', reportForm.title);
    data.append('description', reportForm.description);
    data.append('ticket_id', ticketId);
    data.append('file', reportForm.file);

    try {
      const response = await axios.post(`${API}/reports`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      await axios.post(`${API}/tickets/${ticketId}/link-report/${response.data.id}`);
      toast.success('Report submitted!');
      setShowReportDialog(false);
      setReportForm({ title: '', description: '', file: null });
      fetchTicket();
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const handleCloseTicket = async () => {
    try {
      await axios.post(`${API}/tickets/${ticketId}/close`);
      toast.success('Ticket closed!');
      fetchTicket();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Cannot close ticket');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(`${API}/tickets/${ticketId}`, { status: newStatus });
      toast.success('Status updated');
      fetchTicket();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleEditTicket = () => {
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      assigned_to_division: ticket.assigned_to_division,
      site_id: ticket.site_id || undefined
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/tickets/${ticketId}`, editForm);
      toast.success('Ticket updated!');
      setShowEditDialog(false);
      fetchTicket();
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[priority] || 'bg-secondary text-muted-foreground';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-slate-100 text-slate-800 dark:bg-gray-700/50 dark:text-gray-300',
      'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Closed': 'bg-slate-200 text-slate-600 dark:bg-gray-800 dark:text-gray-400'
    };
    return colors[status] || 'bg-secondary text-muted-foreground';
  };

  if (loading || !ticket) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading ticket details...</div>
      </div>
    );
  }

  const canManage = ['Manager', 'VP'].includes(user?.role);
  const canEdit = user?.role ? true : false;
  const canClose = user?.role && ticket.status !== 'Closed';
  const isCloseDisabled = ticket.linked_report_id && linkedReport?.status !== 'Final';

  return (
    <div className="space-y-6" data-testid="ticket-detail-page">
      <TicketHeader
        ticket={ticket}
        navigate={navigate}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TicketDetailsCard ticket={ticket} />

          <LinkedReportCard linkedReport={linkedReport} />

          <CommentsSection
            ticket={ticket}
            comment={comment}
            setComment={setComment}
            handleAddComment={handleAddComment}
          />
        </div>

        <TicketActions
          ticket={ticket}
          canManage={canManage}
          canEdit={canEdit}
          canClose={canClose}
          isCloseDisabled={isCloseDisabled}
          handleStatusChange={handleStatusChange}
          handleEditTicket={handleEditTicket}
          setShowScheduleDialog={setShowScheduleDialog}
          setScheduleForm={setScheduleForm}
          setShowReportDialog={setShowReportDialog}
          handleCloseTicket={handleCloseTicket}
        />
      </div>

      <TicketDialogs
        ticket={ticket}
        showScheduleDialog={showScheduleDialog}
        setShowScheduleDialog={setShowScheduleDialog}
        showReportDialog={showReportDialog}
        setShowReportDialog={setShowReportDialog}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        scheduleForm={scheduleForm}
        setScheduleForm={setScheduleForm}
        handleCreateSchedule={handleCreateSchedule}
        reportForm={reportForm}
        setReportForm={setReportForm}
        handleSubmitReport={handleSubmitReport}
        editForm={editForm}
        setEditForm={setEditForm}
        handleEditSubmit={handleEditSubmit}
        eligibleUsers={eligibleUsers}
        usersLoading={users.length === 0}
        sites={sites}
        SCHEDULE_TITLES={SCHEDULE_TITLES}
      />
    </div>
  );
};

export default TicketDetail;
