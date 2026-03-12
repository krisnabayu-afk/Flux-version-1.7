import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, History, Shield, Edit2, X } from 'lucide-react';

const API = `${process.env.REACT_APP_API_URL}/api`;

const VersionUpdates = () => {
    const { user } = useAuth();
    const [updates, setUpdates] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [version, setVersion] = useState('');
    const [changes, setChanges] = useState(['']);

    useEffect(() => {
        fetchUpdates();
    }, []);

    const fetchUpdates = async () => {
        try {
            const response = await axios.get(`${API}/version-updates`);
            setUpdates(response.data);
        } catch (error) {
            console.error('Failed to fetch updates:', error);
            toast.error('Failed to load version updates');
        }
    };

    const handleAddChange = () => {
        setChanges([...changes, '']);
    };

    const handleRemoveChange = (index) => {
        const newChanges = changes.filter((_, i) => i !== index);
        setChanges(newChanges);
    };

    const handleChangeText = (index, value) => {
        const newChanges = [...changes];
        newChanges[index] = value;
        setChanges(newChanges);
    };

    const resetForm = () => {
        setVersion('');
        setChanges(['']);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const filteredChanges = changes.filter(c => c.trim() !== '');
        if (!version.trim()) {
            toast.error('Version title is required');
            return;
        }
        if (filteredChanges.length === 0) {
            toast.error('At least one change description is required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                version: version.trim(),
                changes: filteredChanges
            };

            if (isEditing) {
                await axios.put(`${API}/version-updates/${editingId}`, payload);
                toast.success('Version update updated successfully!');
            } else {
                await axios.post(`${API}/version-updates`, payload);
                toast.success('Version update added successfully!');
            }

            setOpen(false);
            resetForm();
            fetchUpdates();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to save version update');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (update) => {
        setVersion(update.version);
        setChanges(update.changes.length > 0 ? update.changes : ['']);
        setEditingId(update.id);
        setIsEditing(true);
        setOpen(true);
    };

    const handleDelete = async (updateId, versionTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${versionTitle}" update?`)) {
            return;
        }

        try {
            await axios.delete(`${API}/version-updates/${updateId}`);
            toast.success('Version update deleted successfully!');
            fetchUpdates();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to delete version update');
        }
    };

    const isSuperUser = user?.role === 'SuperUser';

    return (
        <div className="space-y-6" data-testid="version-updates-page">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Version Update Log</h1>
                    <p className="text-muted-foreground">Track changes and improvements in Flux</p>
                </div>

                {isSuperUser && (
                    <Dialog open={open} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button className="bg-gray-600 hover:bg-gray-700" data-testid="add-update-button">
                                <Plus size={18} className="mr-2" />
                                Add Update
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg" data-testid="update-dialog">
                            <DialogHeader>
                                <DialogTitle>{isEditing ? 'Edit Version Update' : 'Add New Version Update'}</DialogTitle>
                                <DialogDescription>
                                    Enter the version name and list of changes for this update.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="version-title">Version Title</Label>
                                    <Input
                                        id="version-title"
                                        value={version}
                                        onChange={(e) => setVersion(e.target.value)}
                                        placeholder="e.g., Flux Version 1.1"
                                        required
                                        data-testid="version-title-input"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Changes</Label>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                        {changes.map((change, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    value={change}
                                                    onChange={(e) => handleChangeText(index, e.target.value)}
                                                    placeholder={`Change #${index + 1}`}
                                                    required={index === 0}
                                                />
                                                {changes.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveChange(index)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-900/10 shrink-0"
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddChange}
                                        className="w-full mt-2"
                                    >
                                        <Plus size={14} className="mr-1" /> Add Change Item
                                    </Button>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-gray-600 hover:bg-gray-700" disabled={loading}>
                                        {loading ? 'Saving...' : (isEditing ? 'Update Log' : 'Save Log')}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Updates Timeline/List */}
            <div className="space-y-4">
                {updates.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-card rounded-lg border border-dashed border-border">
                        <History size={48} className="mx-auto mb-4 opacity-20" />
                        No version updates recorded yet.
                    </div>
                ) : (
                    updates.map((update) => (
                        <Card key={update.id} className="border-l-4 border-l-primary/50 overflow-hidden shadow-sm" data-testid={`update-card-${update.id}`}>
                            <CardHeader className="pb-3 bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <History size={20} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{update.version}</CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                By {update.created_by} • {new Date(update.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </p>
                                        </div>
                                    </div>

                                    {isSuperUser && (
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(update)}
                                                className="text-muted-foreground hover:text-foreground"
                                                title="Edit update"
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(update.id, update.version)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-900/10"
                                                title="Delete update"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <ul className="space-y-2">
                                    {update.changes.map((change, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground/90">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <span>{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default VersionUpdates;
