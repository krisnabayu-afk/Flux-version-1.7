import React from 'react';

export const QuickStats = ({ schedulesTodayCount, pendingApprovalsCount, openTicketsCount, userRole }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 text-foreground shadow-sm">
                <h3 className="text-lg font-semibold mb-2">My Schedules Today</h3>
                <p className="text-4xl font-bold text-primary">{schedulesTodayCount}</p>
            </div>
            {['SPV', 'Manager', 'VP'].includes(userRole) && (
                <div className="bg-card border border-border rounded-2xl p-6 text-foreground shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">Awaiting My Approval</h3>
                    <p className="text-4xl font-bold text-orange-500">{pendingApprovalsCount}</p>
                </div>
            )}
            {['Manager', 'VP'].includes(userRole) && (
                <div className="bg-card border border-border rounded-2xl p-6 text-foreground shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">Active Tickets</h3>
                    <p className="text-4xl font-bold text-red-500">{openTicketsCount}</p>
                </div>
            )}
        </div>
    );
};
