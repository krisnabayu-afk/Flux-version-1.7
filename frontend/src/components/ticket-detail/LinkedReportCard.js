import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LinkedReportCard = ({ linkedReport }) => {
    if (!linkedReport) return null;

    return (
        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
            <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2 text-foreground">
                    <FileText className="text-purple-600 dark:text-purple-400" size={20} />
                    <span>Linked Report</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p className="font-semibold text-foreground">{linkedReport.title}</p>
                    <p className="text-sm text-muted-foreground">{linkedReport.description}</p>
                    <div className="flex items-center justify-between">
                        <Badge className={linkedReport.status === 'Final'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-transparent dark:border-green-800'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent dark:border-yellow-800'}>
                            {linkedReport.status}
                        </Badge>
                        <Link to="/reports" className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 font-semibold">
                            View in Reports
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
