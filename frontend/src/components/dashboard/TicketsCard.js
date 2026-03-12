import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Ticket as TicketIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TicketsCard = ({ openTickets, getPriorityColor, getStatusColor }) => {
    return (
        <Card className="hover:shadow-lg transition-shadow bg-card" data-testid="tickets-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-foreground">
                        <TicketIcon className="text-destructive" size={24} />
                        <span>Open Tickets</span>
                    </CardTitle>
                    <Badge variant="secondary">{openTickets.length}</Badge>
                </div>
                <CardDescription>Active issues to manage</CardDescription>
            </CardHeader>
            <CardContent>
                {openTickets.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No open tickets</p>
                ) : (
                    <div className="space-y-3">
                        {openTickets.slice(0, 3).map((ticket) => (
                            <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                                <div className="p-3 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer">
                                    <p className="font-semibold text-sm text-foreground">{ticket.title}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {openTickets.length > 3 && (
                            <Link to="/tickets" className="block text-center text-sm text-muted-foreground hover:text-foreground font-semibold mt-2">
                                View all {openTickets.length} tickets
                            </Link>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
