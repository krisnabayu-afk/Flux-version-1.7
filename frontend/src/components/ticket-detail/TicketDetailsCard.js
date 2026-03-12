import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const TicketDetailsCard = ({ ticket }) => {
    return (
        <Card data-testid="ticket-details" className="bg-card border-border">
            <CardHeader>
                <CardTitle className="text-foreground">Description</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-muted-foreground">Assigned To:</p>
                        <p className="text-foreground">{ticket.assigned_to_division}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-muted-foreground">Last Updated:</p>
                        <p className="text-foreground">{new Date(ticket.updated_at).toLocaleString()}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
