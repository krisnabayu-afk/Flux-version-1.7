import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import ExcelPreviewDialog from '../components/ExcelPreviewDialog';
import moment from 'moment';

// Modular Components
import { SiteHeader } from '../components/site-detail/SiteHeader';
import { SiteSummaryCards } from '../components/site-detail/SiteSummaryCards';
import { SiteTabs } from '../components/site-detail/SiteTabs';

// Shared Report Dialogs
import { ViewReportDialog } from '../components/reports/ViewReportDialog';
import { EditReportDialog } from '../components/reports/EditReportDialog';
import { PdfPreviewDialog } from '../components/reports/PdfPreviewDialog';
import { VpConfirmDialog } from '../components/reports/VpConfirmDialog';

const API = `${process.env.REACT_APP_API_URL}/api`;

const SiteDetail = () => {
  const { siteId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Report detail modal states
  const [viewOpen, setViewOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    site_id: '',
    ticket_id: '',
    file: null
  });
  const [revisions, setRevisions] = useState([]);
  const [selectedVersionData, setSelectedVersionData] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('');

  // VP Confirmation Dialog states
  const [showVpConfirmDialog, setShowVpConfirmDialog] = useState(false);
  const [pendingApprovalAction, setPendingApprovalAction] = useState(null);

  // Excel Preview states
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false);
  const [excelPreviewUrl, setExcelPreviewUrl] = useState(null);
  const [excelPreviewName, setExcelPreviewName] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchSiteData();
  }, [siteId]);

  const fetchSiteData = async () => {
    try {
      setLoading(true);

      // Fetch site details directly
      const siteResponse = await axios.get(`${API}/sites/${siteId}`);
      setSite(siteResponse.data);

      // Fetch tickets for this site
      const ticketsResponse = await axios.get(`${API}/tickets?site_id=${siteId}&limit=100`);
      setTickets(ticketsResponse.data.items || []);

      // Fetch reports for this site
      const reportsResponse = await axios.get(`${API}/reports?site_id=${siteId}&limit=100`);
      setReports(reportsResponse.data.items || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch site data:', error);
      toast.error('Failed to load site details');
      setLoading(false);
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      const response = await axios.get(`${API}/reports/${reportId}`);
      setSelectedReport(response.data);
      setSelectedVersionData(null);
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

  const handleApproval = async (reportId, action) => {
    let comment = null;
    if (action === 'revisi') {
      comment = prompt('Please provide a reason for revision:');
      if (!comment) {
        toast.error('Revision reason is required');
        return;
      }
    }

    // VP Confirmation Logic
    if (action === 'approve' && user.role === 'VP') {
      const report = reports.find(r => r.id === reportId) || selectedReport;
      if (report && report.status !== 'Pending VP' && report.status !== 'Final') {
        setPendingApprovalAction({ reportId, action, comment });
        setShowVpConfirmDialog(true);
        return;
      }
    }

    try {
      const payload = action === 'revisi'
        ? { report_id: reportId, action, comment }
        : { report_id: reportId, action: 'approve' };

      await axios.post(`${API}/reports/approve`, payload);
      toast.success(action === 'approve' ? 'Report approved!' : 'Report sent for revision');
      fetchSiteData();
      if (viewOpen && selectedReport?.id === reportId) {
        handleViewReport(reportId);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process approval');
    }
  };

  const handleVpConfirmApproval = async () => {
    if (!pendingApprovalAction) return;
    const { reportId, action, comment } = pendingApprovalAction;

    try {
      const payload = action === 'revisi'
        ? { report_id: reportId, action, comment }
        : { report_id: reportId, action: 'approve' };

      await axios.post(`${API}/reports/approve`, payload);
      toast.success('Report approved!');
      fetchSiteData();
      if (viewOpen && selectedReport?.id === reportId) {
        handleViewReport(reportId);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process approval');
    } finally {
      setShowVpConfirmDialog(false);
      setPendingApprovalAction(null);
    }
  };

  const handleCancelApproval = async (reportId) => {
    if (!window.confirm('Are you sure you want to cancel this approval?')) return;

    try {
      await axios.post(`${API}/reports/cancel-approval`, { report_id: reportId });
      toast.success('Approval cancelled successfully');
      fetchSiteData();
      if (viewOpen && selectedReport?.id === reportId) {
        handleViewReport(reportId);
      }
    } catch (error) {
      let errorMessage = 'Failed to cancel approval';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : error.response.data.detail[0]?.msg || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setEditFormData({
      title: report.title,
      description: report.description,
      site_id: report.site_id || '',
      ticket_id: report.ticket_id || '',
      file: null
    });
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

    try {
      await axios.put(`${API}/reports/${selectedReport.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Report updated successfully!');
      setEditOpen(false);
      fetchSiteData();
      if (viewOpen && selectedReport.id) {
        handleViewReport(selectedReport.id);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update report');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    try {
      await axios.delete(`${API}/reports/${reportId}`);
      toast.success('Report deleted successfully');
      setViewOpen(false);
      fetchSiteData();
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
      handleViewReport(selectedReport.id);
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const downloadFile = (fileUrl, fileData, fileName) => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = `${process.env.REACT_APP_API_URL}${fileUrl}`;
      link.download = fileName;
      link.target = "_blank";
      link.click();
    } else if (fileData) {
      const link = document.createElement('a');
      link.href = `data:application/octet-stream;base64,${fileData}`;
      link.download = fileName;
      link.click();
    } else {
      toast.error("File not available");
    }
  };

  const canEditReport = (report) => report.submitted_by === user.id;

  const canApprove = (report) => {
    if (!['SPV', 'Manager', 'VP'].includes(user?.role)) return false;
    if (report.status === 'Final' || report.status === 'Revisi') return false;
    if (user.role === 'VP') return true;
    if (user.role === 'Manager' && ['Pending SPV', 'Pending Manager'].includes(report.status)) return true;
    if (report.current_approver === user.id) return true;
    return false;
  };

  const canCancelApproval = (report) => {
    if (['Pending Manager', 'Revisi'].includes(report.status)) return false;
    if (user.role === 'Manager' && report.status === 'Pending VP') return true;
    if (user.role === 'VP' && report.status === 'Final') return true;
    return false;
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
    const statusColors = {
      'Open': 'bg-slate-100 text-slate-800 dark:bg-gray-700/50 dark:text-gray-300',
      'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Closed': 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      'Pending SPV': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Pending Manager': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Pending VP': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Final': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Revisi': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return statusColors[status] || 'bg-secondary text-muted-foreground';
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'priority') {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading site details...</div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg text-muted-foreground mb-4">Site not found</div>
        <Button onClick={() => navigate('/sites')}>Back to Sites</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8" data-testid="site-detail-page">
      <SiteHeader site={site} navigate={navigate} />

      <SiteSummaryCards tickets={tickets} reports={reports} />

      <SiteTabs
        tickets={sortedTickets}
        reports={reports}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        sortBy={sortBy}
        setSortBy={setSortBy}
        handleViewReport={handleViewReport}
      />

      <ViewReportDialog
        viewOpen={viewOpen}
        setViewOpen={setViewOpen}
        selectedReport={selectedReport}
        selectedVersionData={selectedVersionData}
        selectedVersion={selectedVersion}
        handleVersionChange={handleVersionChange}
        revisions={revisions}
        downloadFile={downloadFile}
        setPreviewUrl={setPreviewUrl}
        setPreviewName={setPreviewName}
        setPreviewOpen={setPreviewOpen}
        setExcelPreviewUrl={setExcelPreviewUrl}
        setExcelPreviewName={setExcelPreviewName}
        setExcelPreviewOpen={setExcelPreviewOpen}
        canApprove={canApprove}
        handleApproval={handleApproval}
        canCancelApproval={canCancelApproval}
        handleCancelApproval={handleCancelApproval}
        handleAddComment={handleAddComment}
        commentText={commentText}
        setCommentText={setCommentText}
        canEditReport={canEditReport}
        handleDeleteReport={handleDeleteReport}
        getStatusColor={getStatusColor}
      />

      <EditReportDialog
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        handleEditSubmit={handleEditSubmit}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        sites={site ? [site] : []}
        tickets={tickets}
        selectedReport={selectedReport}
      />

      <PdfPreviewDialog
        previewOpen={previewOpen}
        setPreviewOpen={setPreviewOpen}
        previewUrl={previewUrl}
        previewName={previewName}
        downloadFile={() => downloadFile(previewUrl, null, previewName)}
      />

      <ExcelPreviewDialog
        open={excelPreviewOpen}
        onOpenChange={setExcelPreviewOpen}
        fileUrl={excelPreviewUrl}
        fileName={excelPreviewName}
        downloadFile={() => downloadFile(excelPreviewUrl, null, excelPreviewName)}
      />

      <VpConfirmDialog
        showVpConfirmDialog={showVpConfirmDialog}
        setShowVpConfirmDialog={setShowVpConfirmDialog}
        handleVpConfirmApproval={handleVpConfirmApproval}
        setPendingApprovalAction={setPendingApprovalAction}
      />
    </div>
  );
};

export default SiteDetail;
