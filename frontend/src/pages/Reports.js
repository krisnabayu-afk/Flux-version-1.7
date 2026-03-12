import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, Download, Check, X, Eye, Filter, Edit, Search, ArrowUpDown, ChevronsUpDown, Trash2, FileText, ExternalLink, Star, User, CheckCircle } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../lib/utils';
import ExcelPreviewDialog from '../components/ExcelPreviewDialog';

const API = `${process.env.REACT_APP_API_URL}/api`;


import { SiteCombobox } from '../components/reports/SiteCombobox';
import { TicketCombobox } from '../components/reports/TicketCombobox';
import { SiteFilterCombobox } from '../components/reports/SiteFilterCombobox';
import { SubmitReportDialog } from '../components/reports/SubmitReportDialog';
import { ViewReportDialog } from '../components/reports/ViewReportDialog';
import { EditReportDialog } from '../components/reports/EditReportDialog';
import { RatingDialog } from '../components/reports/RatingDialog';
import { VpConfirmDialog } from '../components/reports/VpConfirmDialog';
import { PdfPreviewDialog } from '../components/reports/PdfPreviewDialog';

const Reports = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [sites, setSites] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]); // NEW: Activity categories
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false); // NEW: Preview dialog state
  const [previewUrl, setPreviewUrl] = useState(''); // NEW: PDF preview URL
  const [previewName, setPreviewName] = useState(''); // NEW: PDF preview name
  const [editOpen, setEditOpen] = useState(false); // PHASE 3: Edit dialog
  const [selectedReport, setSelectedReport] = useState(null);
  const [siteFilter, setSiteFilter] = useState(undefined);
  const [divisionFilter, setDivisionFilter] = useState('all'); // NEW: Division filter
  const [regionFilter, setRegionFilter] = useState('all'); // REGIONAL: Region filter
  const [siteSearch, setSiteSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [editSiteSearch, setEditSiteSearch] = useState(''); // PHASE 3: Edit site search
  const [editTicketSearch, setEditTicketSearch] = useState(''); // PHASE 3: Edit ticket search
  const [searchQuery, setSearchQuery] = useState('');
  const [reportFilter, setReportFilter] = useState('all'); // NEW: 'all', 'mine', or 'approving'
  const [sortOrder, setSortOrder] = useState('newest');
  const [formData, setFormData] = useState({
    category_id: '', // NEW: Activity category
    title: '',
    description: '',
    site_id: '',
    ticket_id: '',
    file: null,
    file_2: null // NEW: Second file
  });
  const [commentText, setCommentText] = useState(''); // NEW: Comment text state
  const [editFormData, setEditFormData] = useState({ // PHASE 3: Edit form data
    title: '',
    description: '',
    site_id: '',
    ticket_id: '',
    file: null, // NEW: File replacement
    file_2: null // NEW: Second file replacement
  });
  const [revisions, setRevisions] = useState([]); // NEW: Versioning revisions
  const [selectedVersionData, setSelectedVersionData] = useState(null); // NEW: Data for selected version
  const [selectedVersion, setSelectedVersion] = useState(''); // NEW: Current version ID or 'current'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const itemsPerPage = 15;

  // VP Confirmation Dialog states
  const [showVpConfirmDialog, setShowVpConfirmDialog] = useState(false);
  const [pendingApprovalAction, setPendingApprovalAction] = useState(null);

  // Rating Dialog states (for Manager/VP approve action)
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [pendingRatingAction, setPendingRatingAction] = useState(null); // { reportId, action }
  const [approvalRating, setApprovalRating] = useState(0);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Excel Preview states
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false);
  const [excelPreviewUrl, setExcelPreviewUrl] = useState(null);
  const [excelPreviewName, setExcelPreviewName] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchSites();
    fetchTickets();
    fetchCategories(); // NEW: Fetch categories
  }, []);

  // Handle opening report from navigation state (e.g., from SiteDetail)
  useEffect(() => {
    if (location.state?.openReportId) {
      handleViewReport(location.state.openReportId);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchReports(currentPage, siteFilter, divisionFilter, regionFilter, reportFilter);
  }, [currentPage, siteFilter, divisionFilter, regionFilter, searchQuery, reportFilter]);

  const fetchReports = async (page = 1, site_id = '', division = 'all', region = 'all', filter = 'all') => {
    try {
      const params = {
        page,
        limit: itemsPerPage,
        mine: filter === 'mine',
        approving: filter === 'approving'
      };
      if (site_id && site_id !== 'all') params.site_id = site_id;
      if (division && division !== 'all') params.division = division;
      if (region && region !== 'all') params.region = region;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get(`${API}/reports`, { params });

      // Handle paginated response
      if (response.data.items) {
        setReports(response.data.items);
        setTotalPages(response.data.total_pages);
        setTotalReports(response.data.total);
      } else {
        // Fallback for non-paginated response (just in case)
        setReports(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const fetchSites = async () => {
    try {
      // Request all sites for the dropdown by setting a high limit
      const response = await axios.get(`${API}/sites`, { params: { limit: 1000 } });
      if (response.data.items) {
        setSites(response.data.items);
      } else {
        setSites(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API}/tickets/list/all`);
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.site_id) {
      toast.error('Site Name is required');
      return;
    }

    const data = new FormData();
    if (formData.category_id) data.append('category_id', formData.category_id);
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.site_id) data.append('site_id', formData.site_id);
    if (formData.ticket_id) data.append('ticket_id', formData.ticket_id);
    data.append('file', formData.file);
    if (formData.file_2) data.append('file_2', formData.file_2);

    try {
      await axios.post(`${API}/reports`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Report submitted successfully!');
      setOpen(false);
      fetchReports(currentPage);
      setFormData({ category_id: '', title: '', description: '', site_id: '', ticket_id: '', file: null, file_2: null });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit report');
    }
  };

  const handleApproval = async (reportId, action) => {
    // PHASE 3: Renamed reject to revisi
    if (action === 'revisi') {
      const comment = prompt('Please provide a reason for revision:');
      if (!comment) {
        toast.error('Revision reason is required');
        return;
      }
      try {
        await axios.post(`${API}/reports/approve`, { report_id: reportId, action, comment });
        toast.success('Report sent for revision');
        fetchReports(currentPage, siteFilter, divisionFilter, regionFilter);
        if (viewOpen && selectedReport?.id === reportId) handleViewReport(reportId);
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to process approval');
      }
      return;
    }

    // For approve action by Manager/VP: open rating dialog
    if (action === 'approve' && ['Manager', 'VP'].includes(user.role)) {
      const report = reports.find(r => r.id === reportId) || selectedReport;

      // VP Confirmation Logic: Check if VP is trying to approve before Manager
      if (user.role === 'VP' && report && report.status !== 'Pending VP' && report.status !== 'Final') {
        setPendingApprovalAction({ reportId, action });
        setShowVpConfirmDialog(true);
        return;
      }

      // Open rating dialog
      setPendingRatingAction({ reportId, action });
      setApprovalRating(0);
      setApprovalNotes('');
      setHoverRating(0);
      setShowRatingDialog(true);
      return;
    }

    // SPV or other roles: direct approve
    try {
      await axios.post(`${API}/reports/approve`, { report_id: reportId, action: 'approve' });
      toast.success('Report approved!');
      fetchReports(currentPage, siteFilter, divisionFilter, regionFilter);
      if (viewOpen && selectedReport?.id === reportId) handleViewReport(reportId);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process approval');
    }
  };

  // Submit rating approval from dialog
  const handleRatingApprovalSubmit = async () => {
    if (!pendingRatingAction) return;
    if (approvalRating < 1 || approvalRating > 5) {
      toast.error('Please provide a rating (1-5 stars)');
      return;
    }
    const { reportId, action } = pendingRatingAction;
    try {
      await axios.post(`${API}/reports/approve`, {
        report_id: reportId,
        action: 'approve',
        rating: approvalRating,
        notes: approvalNotes.trim() || undefined
      });
      toast.success('Report approved!');
      setShowRatingDialog(false);
      setPendingRatingAction(null);
      fetchReports(currentPage, siteFilter, divisionFilter, regionFilter);
      if (viewOpen && selectedReport?.id === reportId) handleViewReport(reportId);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process approval');
    }
  };

  // Handle VP Confirmation for early approval — now opens rating dialog instead
  const handleVpConfirmApproval = () => {
    if (!pendingApprovalAction) return;
    const { reportId, action } = pendingApprovalAction;
    setShowVpConfirmDialog(false);
    setPendingApprovalAction(null);
    // Open rating dialog
    setPendingRatingAction({ reportId, action });
    setApprovalRating(0);
    setApprovalNotes('');
    setHoverRating(0);
    setShowRatingDialog(true);
  };

  // Handle Cancel Approval
  const handleCancelApproval = async (reportId) => {
    if (!window.confirm('Are you sure you want to cancel this approval?')) return;

    try {
      await axios.post(`${API}/reports/cancel-approval`, { report_id: reportId });
      toast.success('Approval cancelled successfully');
      fetchReports(currentPage, siteFilter, divisionFilter, regionFilter);
      // If modal is open, refresh it
      if (viewOpen && selectedReport?.id === reportId) {
        handleViewReport(reportId);
      }
    } catch (error) {
      // Handle different error response formats
      let errorMessage = 'Failed to cancel approval';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail[0]?.msg || errorMessage;
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      toast.error(errorMessage);
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      const response = await axios.get(`${API}/reports/${reportId}`);
      setSelectedReport(response.data);
      setSelectedVersionData(null); // Reset to current
      setSelectedVersion('current');
      setViewOpen(true);

      // Fetch revisions
      try {
        const revResponse = await axios.get(`${API}/reports/${reportId}/revisions`);
        setRevisions(revResponse.data);
      } catch (revError) {
        console.error('Failed to fetch revisions:', revError);
        setRevisions([]);
      }
    } catch (error) {
      toast.error('Failed to load report');
    }
  };

  const handleVersionChange = async (versionVal) => {
    setSelectedVersion(versionVal);
    if (versionVal === 'current') {
      setSelectedVersionData(null);
      return;
    }

    try {
      const response = await axios.get(`${API}/reports/${selectedReport.id}/revisions/${versionVal}`);
      setSelectedVersionData(response.data);
    } catch (error) {
      toast.error('Failed to load version data');
    }
  };

  // PHASE 3: Edit report functionality
  const handleEditReport = (report) => {
    setSelectedReport(report);
    setEditFormData({
      title: report.title,
      description: report.description,
      site_id: report.site_id || '',
      ticket_id: report.ticket_id || '',
      file: null, // Reset file
      file_2: null // Reset file 2
    });
    setEditSiteSearch('');
    setEditTicketSearch('');
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.site_id) {
      toast.error('Site Name is required');
      return;
    }

    const data = new FormData();
    data.append('title', editFormData.title);
    data.append('description', editFormData.description);
    if (editFormData.site_id) data.append('site_id', editFormData.site_id);
    if (editFormData.ticket_id) data.append('ticket_id', editFormData.ticket_id);
    if (editFormData.file) data.append('file', editFormData.file);
    if (editFormData.file_2) data.append('file_2', editFormData.file_2);

    try {
      await axios.put(`${API}/reports/${selectedReport.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Report updated successfully!');
      setEditOpen(false);
      fetchReports(currentPage, siteFilter);
      // Refresh selected report if viewing it
      if (viewOpen && selectedReport.id) {
        handleViewReport(selectedReport.id);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update report');
    }
  };

  const canEditReport = (report) => {
    // Only the creator can edit their report
    // Only the creator can edit their report
    return report.submitted_by === user.id;
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;

    try {
      await axios.delete(`${API}/reports/${reportId}`);
      toast.success('Report deleted successfully');
      setOpen(false); // Close any open dialogs if needed
      setViewOpen(false);
      fetchReports(currentPage, siteFilter);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete report');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await axios.post(`${API}/reports/${selectedReport.id}/comments`, { text: commentText });
      toast.success('Comment added!');
      setCommentText('');
      // Refresh report details
      const response = await axios.get(`${API}/reports/${selectedReport.id}`);
      setSelectedReport(response.data);
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const downloadFile = (fileUrl, fileData, fileName) => {
    if (fileUrl) {
      // Use URL if available
      const link = document.createElement('a');
      link.href = `${process.env.REACT_APP_API_URL}${fileUrl}`;
      link.download = fileName;
      link.target = "_blank"; // Open in new tab if possible
      link.click();
    } else if (fileData) {
      // Fallback to base64
      const link = document.createElement('a');
      link.href = `data:application/octet-stream;base64,${fileData}`;
      link.download = fileName;
      link.click();
    } else {
      toast.error("File not available");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending SPV': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-transparent dark:border-purple-800',
      'Pending Manager': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-transparent dark:border-purple-800',
      'Pending VP': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-transparent dark:border-indigo-800',
      'Final': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-transparent dark:border-green-800',
      'Revisi': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-transparent dark:border-orange-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-transparent dark:border-slate-700';
  };
  const canApprove = (report) => {
    // PHASE 3: Non-linear approval logic
    if (!['SPV', 'Manager', 'VP'].includes(user?.role)) return false;
    if (report.status === 'Final' || report.status === 'Revisi') return false;

    // VP can approve at any stage
    if (user.role === 'VP') return true;

    // Manager can approve if status is Pending SPV or Pending Manager
    if (user.role === 'Manager' && ['Pending SPV', 'Pending Manager'].includes(report.status)) return true;

    // SPV can approve only if they are the current approver
    if (report.current_approver === user.id) return true;

    return false;
  };

  const canCancelApproval = (report) => {
    // Cannot cancel if in initial pending states or revision
    if (['Pending SPV', 'Pending Manager', 'Revisi'].includes(report.status)) return false;

    // Manager can cancel ONLY if status is "Pending VP"
    // This means Manager approved it and moved it to VP stage
    if (user.role === 'Manager' && report.status === 'Pending VP') {
      return true;
    }

    // VP can cancel ONLY if status is "Final"
    // This means VP approved it and finalized it
    if (user.role === 'VP' && report.status === 'Final') {
      return true;
    }

    return false;
  };

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(siteSearch.toLowerCase())
  );

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(ticketSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Report Management</h1>
          <p className="text-muted-foreground">Submit and manage your reports here</p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
          <SubmitReportDialog
            open={open}
            setOpen={setOpen}
            handleSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            sites={sites}
            tickets={tickets}
          />

          {/* Primary Filters (Tabs) relocated to header */}
          <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
            <button
              onClick={() => setReportFilter('all')}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2",
                reportFilter === 'all'
                  ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <FileText size={14} />
              All Reports
            </button>
            <button
              onClick={() => setReportFilter('mine')}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2",
                reportFilter === 'mine'
                  ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <User size={14} />
              My Report
            </button>
            {['Manager', 'VP'].includes(user?.role) && (
              <button
                onClick={() => setReportFilter('approving')}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2",
                  reportFilter === 'approving'
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                <CheckCircle size={14} />
                My Stage Approval
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar - Secondary Filters Only */}
      <div className="flex flex-wrap items-center gap-3 py-2">
        {/* Search */}
        <div className="relative flex-grow md:flex-grow-0 md:min-w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports by title, site, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
            data-testid="report-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Site Filter */}
          <div className="w-[180px]">
            <SiteFilterCombobox
              sites={sites}
              value={siteFilter}
              onChange={setSiteFilter}
            />
          </div>

          {/* Division Filter */}
          <div className="w-[180px]">
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm" data-testid="division-filter-select">
                <SelectValue placeholder="Divisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                <SelectItem value="Monitoring">Monitoring</SelectItem>
                <SelectItem value="Infra & Fiberzone">Infra & Fiberzone</SelectItem>
                <SelectItem value="TS & Apps">TS & Apps</SelectItem>
                <SelectItem value="Internal Support">Internal Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Region Filter */}
          <div className="w-[150px]">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm" data-testid="region-filter-select">
                <SelectValue placeholder="Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Region 1">Region 1</SelectItem>
                <SelectItem value="Region 2">Region 2</SelectItem>
                <SelectItem value="Region 3">Region 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm" data-testid="sort-select">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchQuery ? `No reports found matching "${searchQuery}"` : 'No reports submitted yet'}
          </div>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="h-full flex flex-col hover:shadow-lg transition-shadow" data-testid={`report-card-${report.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-foreground">
                      {report.category_name || "Activity"} - {report.site_name || "N/A"}
                    </div>
                    <CardTitle className="text-base font-bold text-slate-950">{report.title}</CardTitle>
                    <div className="text-xs text-muted-foreground">
                      By {report.submitted_by_name} • v{report.version}
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                      Created: {new Date(report.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Badge className={cn("shrink-0", getStatusColor(report.status))}>
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{report.description}</p>

                {report.rejection_comment && (
                  <div className="p-3 bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50 border rounded-lg">
                    <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 mb-1">Revision Required:</p>
                    <p className="text-xs text-orange-700 dark:text-orange-200/80">{report.rejection_comment}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewReport(report.id)}
                    className="text-primary hover:bg-primary/10"
                    data-testid={`view-report-${report.id}`}
                  >
                    <Eye size={14} className="mr-1" />
                    View
                  </Button>

                  {/* PHASE 3: Edit button for report creator */}
                  {canEditReport(report) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditReport(report)}
                      className="text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      data-testid={`edit-report-${report.id}`}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                  )}

                  {/* PHASE 3: Show approve/revisi buttons with non-linear logic */}
                  {canApprove(report) && report.status !== 'Final' && report.status !== 'Revisi' && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApproval(report.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        data-testid={`approve-${report.id}`}
                      >
                        <Check size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproval(report.id, 'revisi')}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-950/30"
                        data-testid={`revisi-${report.id}`}
                      >
                        <X size={14} className="mr-1" />
                        Revisi
                      </Button>
                    </div>
                  )}
                  {canCancelApproval(report) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelApproval(report.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-950/30 ml-auto"
                      data-testid={`cancel-approval-${report.id}`}
                    >
                      <X size={14} className="mr-1" />
                      Cancel Approval
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {
        totalReports > 0 && (
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalReports)} of {totalReports} reports
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )
      }

      {/* View Report Dialog */}
      <ViewReportDialog
        viewOpen={viewOpen} setViewOpen={setViewOpen}
        selectedReport={selectedReport} selectedVersionData={selectedVersionData} selectedVersion={selectedVersion}
        handleVersionChange={handleVersionChange} revisions={revisions}
        downloadFile={downloadFile} setPreviewUrl={setPreviewUrl} setPreviewName={setPreviewName} setPreviewOpen={setPreviewOpen}
        setExcelPreviewUrl={setExcelPreviewUrl} setExcelPreviewName={setExcelPreviewName} setExcelPreviewOpen={setExcelPreviewOpen}
        canApprove={canApprove} handleApproval={handleApproval} canCancelApproval={canCancelApproval} handleCancelApproval={handleCancelApproval}
        handleAddComment={handleAddComment} commentText={commentText} setCommentText={setCommentText}
        canEditReport={canEditReport} handleDeleteReport={handleDeleteReport} getStatusColor={getStatusColor}
      />

      {/* PHASE 3: Edit Report Dialog */}
      <EditReportDialog
        editOpen={editOpen} setEditOpen={setEditOpen}
        handleEditSubmit={handleEditSubmit}
        editFormData={editFormData} setEditFormData={setEditFormData}
        sites={sites} tickets={tickets} selectedReport={selectedReport}
      />
      {/* Excel Preview Dialog */}
      <ExcelPreviewDialog
        open={excelPreviewOpen}
        onOpenChange={setExcelPreviewOpen}
        fileUrl={excelPreviewUrl}
        fileName={excelPreviewName}
        downloadFile={() => downloadFile(excelPreviewUrl, null, excelPreviewName)}
      />

      {/* Fullscreen PDF Preview Dialog */}
      <PdfPreviewDialog
        previewOpen={previewOpen} setPreviewOpen={setPreviewOpen}
        previewName={previewName} previewUrl={previewUrl}
        downloadFile={downloadFile}
      />
      {/* VP Confirmation Dialog */}
      <VpConfirmDialog
        showVpConfirmDialog={showVpConfirmDialog} setShowVpConfirmDialog={setShowVpConfirmDialog}
        setPendingApprovalAction={setPendingApprovalAction} handleVpConfirmApproval={handleVpConfirmApproval}
      />
      {/* Rating Dialog - for Manager/VP approve */}
      <RatingDialog
        showRatingDialog={showRatingDialog} setShowRatingDialog={setShowRatingDialog}
        setPendingRatingAction={setPendingRatingAction}
        approvalRating={approvalRating} setApprovalRating={setApprovalRating}
        hoverRating={hoverRating} setHoverRating={setHoverRating}
        approvalNotes={approvalNotes} setApprovalNotes={setApprovalNotes}
        handleRatingApprovalSubmit={handleRatingApprovalSubmit}
      />
    </div >
  );
};

export default Reports;
