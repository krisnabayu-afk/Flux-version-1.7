import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar } from 'lucide-react';

export const SchedulesCard = ({ schedulesToday }) => {
    return (
        <Card className="hover:shadow-lg transition-shadow bg-card" data-testid="schedules-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-foreground">
                        <Calendar className="text-primary" size={24} />
                        <span>Today's Schedules</span>
                    </CardTitle>
                    <Badge variant="secondary">{schedulesToday.length}</Badge>
                </div>
                <CardDescription>Your tasks for today</CardDescription>
            </CardHeader>
            <CardContent>
                {schedulesToday.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No schedules for today</p>
                ) : (
                    <div className="space-y-3">
                        {schedulesToday.map((schedule) => (
                            <div key={schedule.id} className="p-3 bg-secondary/50 rounded-lg border border-border">
                                <p className="font-semibold text-sm text-foreground">{schedule.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {schedule.description}
                                    {schedule.category_name && ` • ${schedule.category_name}`}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
