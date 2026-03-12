import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Ticket as TicketIcon, Clock, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TicketsList = ({ tickets, getPriorityColor, getStatusColor, sortBy, setSortBy }) => {
    return (
        <Card className="bg-card border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                    <TicketIcon size={18} className="text-primary" />
                    <CardTitle>Site Tickets</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
                        <ChevronsUpDown size={14} /> Sort By:
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary/50 border-border">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="priority">High Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {tickets.length === 0 ? (
                    <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed border-border">
                        <TicketIcon size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No tickets found for this site.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tickets.map((ticket) => (
                            <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                                <div className="group p-4 bg-secondary/30 hover:bg-secondary/60 border border-border rounded-xl transition-all hover:shadow-md cursor-pointer relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge className={`${getPriorityColor(ticket.priority)} border-transparent`}>
                                            {ticket.priority}
                                        </Badge>
                                        <Badge variant="outline" className={`${getStatusColor(ticket.status)} border-current/20`}>
                                            {ticket.status}
                                        </Badge>
                                    </div>
                                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
                                        {ticket.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">
                                        {ticket.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t border-border/50 text-[10px] text-muted-foreground">
                                        <div className="flex items-center">
                                            <Clock size={12} className="mr-1" />
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details <ChevronRight size={12} className="ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
