import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileCheck, Eye } from 'lucide-react';

export const ApprovalsCard = ({ pendingApprovals, handleViewReport, getStatusColor }) => {
    return (
        <Card className="hover:shadow-lg transition-shadow bg-card" data-testid="approvals-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-foreground">
                        <FileCheck className="text-primary" size={24} />
                        <span>Pending Approvals</span>
                    </CardTitle>
                    <Badge variant="secondary">{pendingApprovals.length}</Badge>
                </div>
                <CardDescription>Reports awaiting your review</CardDescription>
            </CardHeader>
            <CardContent>
                {pendingApprovals.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No pending approvals</p>
                ) : (
                    <div className="space-y-3">
                        {pendingApprovals.map((report) => (
                            <div
                                key={report.id}
                                onClick={() => handleViewReport(report.id)}
                                className="p-3 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer"
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-sm text-foreground">{report.title}</p>
                                    <Eye size={16} className="text-muted-foreground" />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">By {report.submitted_by_name}</p>
                                    <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
