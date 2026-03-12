import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus } from 'lucide-react';
import { SiteCombobox } from './SiteCombobox';
import { TicketCombobox } from './TicketCombobox';

export const SubmitReportDialog = ({
    open,
    setOpen,
    handleSubmit,
    formData,
    setFormData,
    categories,
    sites,
    tickets
}) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-purple-500 hover:bg-purple-600" data-testid="submit-report-button">
                    <Plus size={18} className="mr-2" />
                    Submit Report
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col" data-testid="report-dialog" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Submit New Report</DialogTitle>
                    <DialogDescription>Fill in the details to submit a new report.</DialogDescription>
                </DialogHeader>
                <form id="create-report-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            data-testid="report-title-input"
                            placeholder="Bandwidth tidak sesuai"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Activity Category *</Label>
                            <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                                <SelectTrigger data-testid="category-select">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Site Name *</Label>
                            <SiteCombobox
                                sites={sites}
                                value={formData.site_id}
                                onChange={(val) => setFormData({ ...formData, site_id: val })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Related Ticket (Optional)</Label>
                        <TicketCombobox
                            tickets={tickets}
                            value={formData.ticket_id}
                            onChange={(val) => setFormData({ ...formData, ticket_id: val })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required={false}
                            data-testid="report-description-input"
                            placeholder="Deskripsi singkat report"
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Attachments</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="file" className="text-xs">Document 1 *</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                    required
                                    data-testid="report-file-input"
                                    accept=".pdf,.doc,.docx,.xlsx,.xls"
                                    className="cursor-pointer bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file_2" className="text-xs">Document 2 (Optional)</Label>
                                <Input
                                    id="file_2"
                                    type="file"
                                    onChange={(e) => setFormData({ ...formData, file_2: e.target.files[0] })}
                                    data-testid="report-file-2-input"
                                    accept=".pdf,.doc,.docx,.xlsx,.xls"
                                    className="cursor-pointer bg-background"
                                />
                            </div>
                        </div>
                    </div>
                </form>
                <div className="pt-4 border-t mt-2 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" form="create-report-form" className="bg-purple-500 hover:bg-purple-600" data-testid="submit-report-form">
                        Submit Report
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
