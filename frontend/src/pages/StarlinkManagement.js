import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '../components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../components/ui/table';
import { Satellite, Plus, Search, RefreshCw, Trash2, Edit, AlertTriangle } from 'lucide-react';

const API = `${process.env.REACT_APP_API_URL}/api`;

const StarlinkManagement = () => {
    const { user } = useAuth();
    const [starlinks, setStarlinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentStarlink, setCurrentStarlink] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        sn: '',
        position: '',
        account_email: '',
        package_status: '',
        expiration_date: ''
    });

    useEffect(() => {
        fetchStarlinks();
    }, []);

    const fetchStarlinks = async () => {
        try {
            const response = await axios.get(`${API}/starlinks`);
            setStarlinks(response.data);
        } catch (error) {
            console.error('Failed to fetch starlinks:', error);
            toast.error("Failed to load Starlink data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/starlinks`, formData);
            toast.success("Starlink added successfully");
            setIsAddOpen(false);
            setFormData({
                name: '',
                sn: '',
                position: '',
                account_email: '',
                package_status: '',
                expiration_date: ''
            });
            fetchStarlinks();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to add Starlink");
        }
    };

    const handleEditClick = (starlink) => {
        setCurrentStarlink(starlink);
        setFormData({
            name: starlink.name,
            sn: starlink.sn,
            position: starlink.position,
            account_email: starlink.account_email || '',
            package_status: starlink.package_status,
            expiration_date: starlink.expiration_date.split('T')[0] // Format for date input
        });
        setIsEditOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API}/starlinks/${currentStarlink.id}`, formData);
            toast.success("Starlink updated successfully");
            setIsEditOpen(false);
            setCurrentStarlink(null);
            fetchStarlinks();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to update Starlink");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this Starlink?")) return;
        try {
            await axios.delete(`${API}/starlinks/${id}`);
            toast.success("Starlink deleted successfully");
            fetchStarlinks();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to delete Starlink");
        }
    };

    const handleRenew = async (id) => {
        if (!window.confirm("Renew package for 30 days?")) return;
        try {
            await axios.post(`${API}/starlinks/${id}/renew`);
            toast.success("Package renewed successfully");
            fetchStarlinks();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to renew package");
        }
    };

    const filteredStarlinks = starlinks.filter(starlink =>
        starlink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        starlink.sn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        starlink.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (starlink.account_email && starlink.account_email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getDaysUntilExpiration = (dateString) => {
        const today = new Date();
        const expDate = new Date(dateString);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getExpirationBadge = (dateString) => {
        const days = getDaysUntilExpiration(dateString);
        if (days < 0) return <Badge variant="destructive">Expired</Badge>;
        if (days <= 3) return <Badge className="bg-red-500 hover:bg-red-600">Expires in {days} days</Badge>;
        if (days <= 7) return <Badge className="bg-orange-500 hover:bg-orange-600">Expires in {days} days</Badge>;
        return <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Satellite className="h-8 w-8 text-blue-500" />
                        Starlink Management
                    </h1>
                    <p className="text-muted-foreground">Manage Starlink devices, locations, and package renewals.</p>
                </div>
                {['Manager', 'VP'].includes(user?.role) && (
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Starlink
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Starlink</DialogTitle>
                                <DialogDescription>Enter the details for the new Starlink device.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Starlink Name</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sn">Serial Number (SN)</Label>
                                    <Input id="sn" name="sn" value={formData.sn} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position (Location/Site)</Label>
                                    <Input id="position" name="position" value={formData.position} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_email">Account Email</Label>
                                    <Input id="account_email" name="account_email" type="email" value={formData.account_email} onChange={handleInputChange} placeholder="e.g. user@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="package_status">Package Status</Label>
                                    <Input id="package_status" name="package_status" value={formData.package_status} onChange={handleInputChange} placeholder="e.g. Account A - Roaming" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expiration_date">Expiration Date</Label>
                                    <Input id="expiration_date" name="expiration_date" type="date" value={formData.expiration_date} onChange={handleInputChange} required />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Create Starlink</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Device List</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search devices..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>SN</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Account Email</TableHead>
                                <TableHead>Package Status</TableHead>
                                <TableHead>Expiration Date</TableHead>
                                <TableHead>Status</TableHead>
                                {['Manager', 'VP'].includes(user?.role) && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStarlinks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No Starlink devices found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStarlinks.map((starlink) => (
                                    <TableRow key={starlink.id}>
                                        <TableCell className="font-medium">{starlink.name}</TableCell>
                                        <TableCell>{starlink.sn}</TableCell>
                                        <TableCell>{starlink.position}</TableCell>
                                        <TableCell>{starlink.account_email}</TableCell>
                                        <TableCell>{starlink.package_status}</TableCell>
                                        <TableCell>{new Date(starlink.expiration_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{getExpirationBadge(starlink.expiration_date)}</TableCell>
                                        {['Manager', 'VP'].includes(user?.role) && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleRenew(starlink.id)} title="Renew Package (+30 Days)">
                                                        <RefreshCw className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(starlink)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(starlink.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Starlink</DialogTitle>
                        <DialogDescription>Update Starlink details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Starlink Name</Label>
                            <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-sn">Serial Number (SN)</Label>
                            <Input id="edit-sn" name="sn" value={formData.sn} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-position">Position (Location/Site)</Label>
                            <Input id="edit-position" name="position" value={formData.position} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-account_email">Account Email</Label>
                            <Input id="edit-account_email" name="account_email" type="email" value={formData.account_email} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-package_status">Package Status</Label>
                            <Input id="edit-package_status" name="package_status" value={formData.package_status} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-expiration_date">Expiration Date</Label>
                            <Input id="edit-expiration_date" name="expiration_date" type="date" value={formData.expiration_date} onChange={handleInputChange} required />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update Starlink</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StarlinkManagement;
