import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { MessageSquare } from 'lucide-react';

export const CommentsSection = ({ ticket, comment, setComment, handleAddComment }) => {
    return (
        <Card data-testid="comments-section" className="bg-card border-border">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                    <MessageSquare size={20} />
                    <span>Comments</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {ticket.comments && ticket.comments.length > 0 ? (
                    <div className="space-y-3">
                        {ticket.comments.map((c) => (
                            <div key={c.id} className="p-4 bg-muted border border-border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-semibold text-sm text-foreground">{c.user_name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                                </div>
                                <p className="text-sm text-foreground">{c.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No comments yet</p>
                )}

                <form onSubmit={handleAddComment} className="space-y-3">
                    <Textarea
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        data-testid="comment-input"
                        rows={3}
                    />
                    <Button type="submit" size="sm" data-testid="add-comment-button">
                        Add Comment
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
