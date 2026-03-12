import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // PHASE 5
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Plus, MapPin, Edit, Trash2, Eye, Search } from 'lucide-react'; // PHASE 5: Added Eye icon
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const API = `${process.env.REACT_APP_API_URL}/api`;

const Sites = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // PHASE 5
  const [sites, setSites] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // NEW: Search query state
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cid: '',
    location: '',
    description: '',
    region: '',  // REGIONAL
    status: 'active'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSites, setTotalSites] = useState(0);
  const itemsPerPage = 15;

  useEffect(() => {
    // Reset to page 1 when search query changes
    if (searchQuery) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchSites(currentPage);
  }, [currentPage, searchQuery]);

  const fetchSites = async (page = 1) => {
    try {
      const params = {
        page,
        limit: itemsPerPage
      };

      // Add search query if present
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get(`${API}/sites`, {
        params
      });
      // Handle paginated response
      if (response.data.items) {
        setSites(response.data.items);
        setTotalPages(response.data.total_pages);
        setTotalSites(response.data.total);
      } else {
        // Fallback
        setSites(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await axios.put(`${API}/sites/${selectedSite.id}`, formData);
        toast.success('Site updated successfully!');
      } else {
        await axios.post(`${API}/sites`, formData);
        toast.success('Site created successfully!');
      }
      setOpen(false);
      setEditMode(false);
      setSelectedSite(null);
      setFormData({ name: '', cid: '', location: '', description: '', region: '', status: 'active' });
      fetchSites(currentPage);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save site');
    }
  };

  const handleEdit = (site) => {
    setSelectedSite(site);
    setFormData({
      name: site.name,
      cid: site.cid || '',
      location: site.location || '',
      description: site.description || '',
      region: site.region || '',  // REGIONAL
      status: site.status
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (siteId) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;

    try {
      await axios.delete(`${API}/sites/${siteId}`);
      toast.success('Site deleted successfully!');
      fetchSites(currentPage);
    } catch (error) {
      toast.error('Failed to delete site');
    }
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedSite(null);
    setFormData({ name: '', cid: '', location: '', description: '', region: '', status: 'active' });
    setOpen(true);
  };

  return (
    <div className="space-y-6" data-testid="sites-page">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Site Management</h1>
          <p className="text-muted-foreground">Manage locations and sites for reports and tickets</p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-input text-foreground"
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} className="bg-green-500 hover:bg-green-600" data-testid="create-site-button">
                <Plus size={18} className="mr-2" />
                Create Site
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="site-dialog" className="bg-card border-border text-foreground" onCloseAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="text-foreground">{editMode ? 'Edit Site' : 'Create New Site'}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {editMode ? 'Update the site details below.' : 'Fill in the details to create a new site.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cid" className="text-foreground">CID</Label>
                    <Input
                      id="cid"
                      value={formData.cid}
                      onChange={(e) => setFormData({ ...formData, cid: e.target.value })}
                      data-testid="site-cid-input"
                      className="bg-background border-input text-foreground"
                      placeholder="VTIB-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Site Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="site-name-input"
                      className="bg-background border-input text-foreground"
                      placeholder="Kantor Nakula"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-foreground">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    data-testid="site-location-input"
                    className="bg-background border-input text-foreground"
                    placeholder="Jl. Nakula, No. 123, Badung, Bali, Indonesia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="site-description-input"
                    className="bg-background border-input text-foreground"
                    placeholder="Detail Services Site (BW=100Mbps, FO=CGS)"
                    rows={3}
                  />
                </div>

                {/* REGIONAL: Region Field */}
                <div className="space-y-2">
                  <Label className="text-foreground">Region</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                    <SelectTrigger data-testid="site-region-select" className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-foreground">
                      <SelectItem value="Region 1">Region 1</SelectItem>
                      <SelectItem value="Region 2">Region 2</SelectItem>
                      <SelectItem value="Region 3">Region 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editMode && (
                  <div className="space-y-2">
                    <Label className="text-foreground">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger data-testid="site-status-select" className="bg-background border-input text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-foreground">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border text-foreground hover:bg-accent">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-500 hover:bg-green-600" data-testid="submit-site-button">
                    {editMode ? 'Update Site' : 'Create Site'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchQuery ? `No sites found matching "${searchQuery}"` : 'No sites created yet'}
          </div>
        ) : (
          sites.map((site) => (
            <Card key={site.id} className="bg-card border-border hover:shadow-lg transition-shadow" data-testid={`site-card-${site.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2 text-foreground">
                    <MapPin size={20} className="text-green-500" />
                    <span>{site.cid ? `${site.cid} ${site.name}` : site.name}</span>
                  </CardTitle>
                  <Badge className={site.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-transparent dark:border-green-800'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-transparent dark:border-slate-700'}>
                    {site.status}
                  </Badge>
                </div>
                {site.location && (
                  <CardDescription className="text-sm text-muted-foreground">{site.location}</CardDescription>
                )}
                {site.region && (
                  <Badge className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-transparent dark:border-blue-800">{site.region}</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {site.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{site.description}</p>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  {/* PHASE 5: View Details Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/sites/${site.id}`)}
                    className="text-muted-foreground border-border bg-secondary/50 hover:bg-secondary"
                    data-testid={`view-site-${site.id}`}
                  >
                    <Eye size={14} className="mr-1" />
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(site)}
                    data-testid={`edit-site-${site.id}`}
                    className="border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  {user?.role === 'SuperUser' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(site.id)}
                      className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:border-red-900/50 dark:bg-red-900/10 dark:hover:bg-red-900/30"
                      data-testid={`delete-site-${site.id}`}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  )}
                </div>



                <p className="text-xs text-muted-foreground pt-1">
                  Created {new Date(site.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}

      </div>

      {/* Pagination Controls */}
      {totalSites > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalSites)} of {totalSites} sites
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div >
  );
};

export default Sites;
