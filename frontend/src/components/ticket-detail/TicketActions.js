import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Edit, Calendar as CalendarIcon, FileText, CheckCircle } from 'lucide-react';

export const TicketActions = ({
    ticket,
    canManage,
    canEdit,
    canClose,
    isCloseDisabled,
    handleStatusChange,
    handleEditTicket,
    setShowScheduleDialog,
    setScheduleForm,
    setShowReportDialog,
    handleCloseTicket
}) => {
    return (
        <div className="space-y-6">
            {/* Status Management */}
            {canManage && ticket.status !== 'Closed' && (
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-lg text-foreground">Manage Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Select value={ticket.status} onValueChange={handleStatusChange}>
                            <SelectTrigger data-testid="status-select" className="bg-background border-input text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            )}

            {/* Integration Actions */}
            <Card className="border-2 border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-lg text-foreground">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Edit Ticket Button */}
                    {canEdit && ticket.status !== 'Closed' && (
                        <Button
                            onClick={handleEditTicket}
                            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            data-testid="edit-ticket-button"
                        >
                            <Edit size={16} className="mr-2" />
                            Edit Ticket
                        </Button>
                    )}

                    {/* Add to Schedule */}
                    {canManage && (
                        <Button
                            onClick={() => {
                                setScheduleForm(prev => ({ ...prev, site_id: ticket?.site_id || '' }));
                                setShowScheduleDialog(true);
                            }}
                            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            data-testid="add-to-schedule-button"
                        >
                            <CalendarIcon size={16} className="mr-2" />
                            Add to Schedule
                        </Button>
                    )}

                    {/* Submit Report */}
                    {!ticket.linked_report_id && (
                        <Button
                            onClick={() => setShowReportDialog(true)}
                            className="w-full bg-purple-500 hover:bg-purple-600"
                            data-testid="submit-report-button"
                        >
                            <FileText size={16} className="mr-2" />
                            Submit Report
                        </Button>
                    )}

                    {/* Close Ticket */}
                    {canClose && (
                        <div className="space-y-2">
                            <Button
                                onClick={handleCloseTicket}
                                disabled={isCloseDisabled}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                data-testid="close-ticket-button"
                            >
                                <CheckCircle size={16} className="mr-2" />
                                Close Ticket
                            </Button>
                            {isCloseDisabled && (
                                <p className="text-xs text-red-600 text-center">
                                    Linked report must be approved before closing
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
