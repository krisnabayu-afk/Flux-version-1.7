import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Ticket as TicketIcon, FileText } from 'lucide-react';
import { TicketsList } from './TicketsList';
import { ReportsList } from './ReportsList';

export const SiteTabs = ({
    tickets,
    reports,
    getPriorityColor,
    getStatusColor,
    sortBy,
    setSortBy,
    handleViewReport
}) => {
    return (
        <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="grid w-80 grid-cols-2 mb-6 bg-secondary/50 p-1 rounded-xl">
                <TabsTrigger value="tickets" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <TicketIcon size={14} /> Tickets
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <FileText size={14} /> Reports
                </TabsTrigger>
            </TabsList>
            <TabsContent value="tickets" className="mt-0 ring-offset-background focus-visible:outline-none">
                <TicketsList
                    tickets={tickets}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                />
            </TabsContent>
            <TabsContent value="reports" className="mt-0 ring-offset-background focus-visible:outline-none">
                <ReportsList
                    reports={reports}
                    getStatusColor={getStatusColor}
                    handleViewReport={handleViewReport}
                />
            </TabsContent>
        </Tabs>
    );
};
