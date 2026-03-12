import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import ExcelPreviewDialog from '../components/ExcelPreviewDialog';

// Modular Components
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { SchedulesCard } from '../components/dashboard/SchedulesCard';
import { ApprovalsCard } from '../components/dashboard/ApprovalsCard';
import { TicketsCard } from '../components/dashboard/TicketsCard';
import { QuickStats } from '../components/dashboard/QuickStats';
import { StarlinkAlert } from '../components/dashboard/StarlinkAlert';

// Shared Report Dialogs
import { ViewReportDialog } from '../components/reports/ViewReportDialog';
import { PdfPreviewDialog } from '../components/reports/PdfPreviewDialog';
import { RatingDialog } from '../components/reports/RatingDialog';
import { VpConfirmDialog } from '../components/reports/VpConfirmDialog';

const API = `${process.env.REACT_APP_API_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    schedules_today: [],
    pending_approvals: [],
    open_tickets: [],
    expiring_starlinks: []
  });
  const [loading, setLoading] = useState(true);
  const [isStarlinkDialogOpen, setIsStarlinkDialogOpen] = useState(false);

  // Report Modal State
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [commentText, setCommentText] = useState('');

  // VP Confirmation Dialog State
  const [showVpConfirmDialog, setShowVpConfirmDialog] = useState(false);
  const [pendingApprovalAction, setPendingApprovalAction] = useState(null);

  // Excel Preview states
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false);
  const [excelPreviewUrl, setExcelPreviewUrl] = useState(null);
  const [excelPreviewName, setExcelPreviewName] = useState(null);

  const [revisions, setRevisions] = useState([]);
  const [selectedVersionData, setSelectedVersionData] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('');

  // Rating Dialog states
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [pendingRatingAction, setPendingRatingAction] = useState(null);
  const [approvalRating, setApprovalRating] = useState(0);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dashboardData.expiring_starlinks && dashboardData.expiring_starlinks.length > 0) {
      setIsStarlinkDialogOpen(true);
    }
  }, [dashboardData.expiring_starlinks]);

  const handleViewReport = async (reportId) => {
    try {
      const response = await axios.get(`${API}/reports/${reportId}`);
      setSelectedReport(response.data);
      setSelectedVersionData(null);
      setSelectedVersion('current');
      setViewOpen(true);

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
    if (action === 'revisi') {
      const comment = prompt('Please provide a reason for revision:');
      if (!comment) {
        toast.error('Revision reason is required');
        return;
      }
      try {
        await axios.post(`${API}/reports/approve`, { report_id: reportId, action, comment });
        toast.success('Report sent for revision');
        fetchDashboard();
        if (viewOpen && selectedReport?.id === reportId) {
          // Refresh report details instead of closing, to match Reports.js
          const response = await axios.get(`${API}/reports/${reportId}`);
          setSelectedReport(response.data);
        }
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to process approval');
      }
      return;
    }

    // For approve action by Manager/VP: open rating dialog
    if (action === 'approve' && ['Manager', 'VP'].includes(user.role)) {
      const report = dashboardData.pending_approvals.find(r => r.id === reportId) || selectedReport;

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
      fetchDashboard();
      if (viewOpen && selectedReport?.id === reportId) {
        const response = await axios.get(`${API}/reports/${reportId}`);
        setSelectedReport(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process approval');
    }
  };

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
      fetchDashboard();
      if (viewOpen && selectedReport?.id === reportId) {
        const response = await axios.get(`${API}/reports/${reportId}`);
        setSelectedReport(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process approval');
    }
  };

  const handleVpConfirmApproval = async () => {
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

  const handleCancelApproval = async (reportId) => {
    if (!window.confirm('Are you sure you want to cancel this approval?')) return;

    try {
      await axios.post(`${API}/reports/cancel-approval`, { report_id: reportId });
      toast.success('Approval cancelled successfully');
      fetchDashboard();
      if (viewOpen) setViewOpen(false);
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await axios.post(`${API}/reports/${selectedReport.id}/comments`, { text: commentText });
      toast.success('Comment added!');
      setCommentText('');
      const response = await axios.get(`${API}/reports/${selectedReport.id}`);
      setSelectedReport(response.data);
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

  const canApprove = (report) => {
    if (!['SPV', 'Manager', 'VP'].includes(user?.role)) return false;
    if (report.status === 'Final' || report.status === 'Revisi') return false;
    if (user.role === 'VP') return true;
    if (user.role === 'Manager' && ['Pending SPV', 'Pending Manager'].includes(report.status)) return true;
    if (report.current_approver === user.id) return true;
    return false;
  };

  const canCancelApproval = (report) => {
    if (['Pending SPV', 'Pending Manager', 'Revisi'].includes(report.status)) return false;
    if (user.role === 'Manager' && report.status === 'Pending VP') return true;
    if (user.role === 'VP' && report.status === 'Final') return true;
    return false;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-green-100/50 text-green-700 border-green-200',
      Medium: 'bg-yellow-100/50 text-yellow-700 border-yellow-200',
      High: 'bg-red-100/50 text-red-700 border-red-200'
    };
    return colors[priority] || 'bg-secondary text-muted-foreground border-border';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard">
      <DashboardHeader user={user} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SchedulesCard schedulesToday={dashboardData.schedules_today} />

        {['SPV', 'Manager', 'VP'].includes(user?.role) && (
          <ApprovalsCard
            pendingApprovals={dashboardData.pending_approvals}
            handleViewReport={handleViewReport}
            getStatusColor={getStatusColor}
          />
        )}

        {['Manager', 'VP'].includes(user?.role) && (
          <TicketsCard
            openTickets={dashboardData.open_tickets}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        )}
      </div>

      <QuickStats
        schedulesTodayCount={dashboardData.schedules_today.length}
        pendingApprovalsCount={dashboardData.pending_approvals.length}
        openTicketsCount={dashboardData.open_tickets.length}
        userRole={user?.role}
      />

      <StarlinkAlert
        isOpen={isStarlinkDialogOpen}
        onOpenChange={setIsStarlinkDialogOpen}
        expiringStarlinks={dashboardData.expiring_starlinks}
      />

      {/* Shared Dialogs */}
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
        canEditReport={() => false} // No edit from dashboard currently
        handleDeleteReport={() => { }} // No delete from dashboard currently
        getStatusColor={getStatusColor}
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

      <RatingDialog
        showRatingDialog={showRatingDialog}
        setShowRatingDialog={setShowRatingDialog}
        setPendingRatingAction={setPendingRatingAction}
        approvalRating={approvalRating}
        setApprovalRating={setApprovalRating}
        hoverRating={hoverRating}
        setHoverRating={setHoverRating}
        approvalNotes={approvalNotes}
        setApprovalNotes={setApprovalNotes}
        handleRatingApprovalSubmit={handleRatingApprovalSubmit}
      />
    </div>
  );
};

export default Dashboard;
