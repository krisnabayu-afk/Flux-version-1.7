import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Ticket as TicketIcon, FileCheck, AlertCircle } from 'lucide-react';

export const SiteSummaryCards = ({ tickets, reports }) => {
    const openTicketsCount = tickets.filter(t => t.status !== 'Closed').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Tickets</CardTitle>
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <TicketIcon size={18} className="text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{tickets.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Lifetime tickets for this site</p>
                </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Open Tickets</CardTitle>
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <AlertCircle size={18} className="text-red-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{openTicketsCount}</div>
                    <p className="text-xs text-muted-foreground mt-1 text-red-500/80">Requires immediate attention</p>
                </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Reports</CardTitle>
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <FileCheck size={18} className="text-purple-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{reports.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Validated performance records</p>
                </CardContent>
            </Card>
        </div>
    );
};
