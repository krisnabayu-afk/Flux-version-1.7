import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, MapPin } from 'lucide-react';

export const SiteHeader = ({ site, navigate }) => {
    if (!site) return null;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/sites')}
                    className="rounded-full hover:bg-secondary"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
                            {site.name}
                        </h1>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Site Detail
                        </Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <MapPin size={14} className="mr-1" />
                        <span className="text-sm font-medium">{site.location || 'Unknown Location'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
