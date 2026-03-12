import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Satellite } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StarlinkAlert = ({ isOpen, onOpenChange, expiringStarlinks }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-500">
                        <Satellite className="h-5 w-5" />
                        Starlink Renewals Required
                    </DialogTitle>
                    <DialogDescription>
                        The following Starlink devices are expiring within 3 days:
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 my-2">
                    {expiringStarlinks?.map((starlink) => {
                        const daysLeft = Math.ceil((new Date(starlink.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
                        return (
                            <div key={starlink.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                                <div>
                                    <p className="font-semibold text-sm">{starlink.name}</p>
                                    <p className="text-xs text-muted-foreground">{starlink.position}</p>
                                </div>
                                <Badge variant={daysLeft <= 0 ? "destructive" : "warning"} className={daysLeft > 0 ? "bg-orange-500 hover:bg-orange-600" : ""}>
                                    {daysLeft <= 0 ? "Expired" : `${daysLeft} days`}
                                </Badge>
                            </div>
                        );
                    })}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Link to="/starlink" onClick={() => onOpenChange(false)}>
                        <Button>
                            Manage Starlinks
                        </Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
