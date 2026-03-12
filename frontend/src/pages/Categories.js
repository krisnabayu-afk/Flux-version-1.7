import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Tag, Shield } from 'lucide-react';

const API = `${process.env.REACT_APP_API_URL}/api`;

const Categories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API}/activity-categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            toast.error('Category name is required');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API}/activity-categories`, { name: newCategory.trim() });
            toast.success('Category created successfully!');
            setOpen(false);
            setNewCategory('');
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId, categoryName) => {
        if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
            return;
        }

        try {
            await axios.delete(`${API}/activity-categories/${categoryId}`);
            toast.success('Category deleted successfully!');
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to delete category');
        }
    };

    // Only SuperUser can access this page
    if (user?.role !== 'SuperUser') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Shield size={64} className="text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
                <p className="text-gray-500">Only SuperUser can manage activity categories.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="categories-page">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Activity Categories</h1>
                    <p className="text-muted-foreground">Manage activity categories for schedules and reports</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gray-600 hover:bg-gray-700" data-testid="add-category-button">
                            <Plus size={18} className="mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md" data-testid="category-dialog">
                        <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                            <DialogDescription>Enter a name for the new activity category.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category-name">Category Name</Label>
                                <Input
                                    id="category-name"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="e.g., Installation, Training"
                                    required
                                    data-testid="category-name-input"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-gray-600 hover:bg-gray-700" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No categories found. Create your first category!
                    </div>
                ) : (
                    categories.map((category) => (
                        <Card key={category.id} className="hover:shadow-md transition-shadow" data-testid={`category-card-${category.id}`}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Tag size={20} className="text-gray-400" />
                                        <CardTitle className="text-lg">{category.name}</CardTitle>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(category.id, category.name)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-900/30"
                                        data-testid={`delete-category-${category.id}`}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-slate-400">
                                    Created: {new Date(category.created_at).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Categories;
