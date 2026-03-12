import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileText, Eye, Clock, ChevronRight } from 'lucide-react';

export const ReportsList = ({ reports, getStatusColor, handleViewReport }) => {
    return (
        <Card className="bg-card border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    <CardTitle>Site Reports</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {reports.length === 0 ? (
                    <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed border-border">
                        <FileText size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No reports found for this site.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                onClick={() => handleViewReport(report.id)}
                                className="group p-4 bg-secondary/30 hover:bg-secondary/60 border border-border rounded-xl transition-all hover:shadow-md cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <Badge className={`${getStatusColor(report.status)} border-transparent`}>
                                        {report.status}
                                    </Badge>
                                    <div className="p-1.5 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye size={14} className="text-primary" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
                                    {report.title}
                                </h4>
                                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-[10px] text-muted-foreground">
                                    <div className="flex items-center">
                                        <Clock size={12} className="mr-1" />
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        Click to View <ChevronRight size={12} className="ml-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
