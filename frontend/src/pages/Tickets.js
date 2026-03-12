import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { Plus, AlertCircle, Filter, Search, ArrowUpDown, Check, ChevronsUpDown, Pencil } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../lib/utils';
import SiteCombobox from '../components/SiteCombobox';

const API = `${process.env.REACT_APP_API_URL}/api`;

const SiteFilterCombobox = ({ sites, value, onChange }) => {
  const [open, setOpen] = useState(false);

  const selectedSite = sites.find((site) => site.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background border-input hover:bg-accent text-foreground overflow-hidden"
          data-testid="site-filter-select"
        >
          <span className="truncate mr-2">
            {value && value !== 'all'
              ? selectedSite?.name
              : "All Sites"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-popover border-border">
        <Command className="bg-popover border-border">
          <CommandInput placeholder="Search site..." className="text-foreground" />
          <CommandList>
            <CommandEmpty className="text-muted-foreground">No site found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all-sites"
                className="text-foreground data-[selected=true]:bg-accent"
                onSelect={() => {
                  onChange('all');
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === 'all' || !value ? "opacity-100" : "opacity-0"
                  )}
                />
                All Sites
              </CommandItem>
              {sites.map((site) => (
                <CommandItem
                  key={site.id}
                  value={site.name}
                  className="text-foreground data-[selected=true]:bg-accent"
                  onSelect={() => {
                    onChange(site.id === value ? 'all' : site.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === site.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {site.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};



const Tickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [sites, setSites] = useState([]);
  const [open, setOpen] = useState(false);
  const [siteFilter, setSiteFilter] = useState(undefined);
  const [regionFilter, setRegionFilter] = useState('all'); // REGIONAL: Region filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all'); // NEW: Status filter
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assigned_to_division: 'Monitoring',
    site_id: undefined
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchTickets();
    fetchSites();
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchTickets(currentPage, siteFilter, regionFilter);
  }, [currentPage, siteFilter, regionFilter, searchQuery]);

  const fetchTickets = async (page = 1, site_id = '', region = 'all') => {
    try {
      const params = {
        page,
        limit: itemsPerPage
      };
      if (site_id && site_id !== 'all') params.site_id = site_id;
      if (region && region !== 'all') params.region = region;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get(`${API}/tickets`, { params });


      // Handle paginated response
      if (response.data.items) {
        setTickets(response.data.items);
        setTotalPages(response.data.total_pages);
        setTotalTickets(response.data.total);
      } else {
        // Fallback
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const fetchSites = async () => {
    try {
      // Request all sites for the dropdown by setting a high limit
      const response = await axios.get(`${API}/sites`, { params: { limit: 1000 } });
      if (response.data.items) {
        setSites(response.data.items);
      } else {
        setSites(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/tickets`, formData);
      toast.success('Ticket created successfully!');
      setOpen(false);
      fetchTickets(currentPage, siteFilter);
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        assigned_to_division: 'Monitoring',
        site_id: undefined
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create ticket');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-transparent dark:border-green-800',
      Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent dark:border-yellow-800',
      High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-transparent dark:border-red-800'
    };
    return colors[priority] || 'bg-secondary text-muted-foreground';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-slate-100 text-slate-800 dark:bg-gray-700/50 dark:text-gray-300 border-transparent dark:border-gray-600',
      'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent dark:border-yellow-800',
      'Closed': 'bg-slate-200 text-slate-600 dark:bg-gray-800 dark:text-gray-400 border-transparent dark:border-gray-700'
    };
    return colors[status] || 'bg-secondary text-muted-foreground';
  };

  const getDivisionColor = (division) => {
    const colors = {
      'Monitoring': 'bg-blue-500',
      'Infra': 'bg-purple-500',
      'TS': 'bg-green-500',
      'Internal Support': 'bg-cyan-500'
    };
    return colors[division] || 'bg-gray-500';
  };

  // Filter tickets by status (active/all) - this is done client-side
  const filteredTickets = statusFilter === 'active'
    ? tickets.filter(ticket => ticket.status !== 'Closed')
    : tickets;

  return (
    <div className="space-y-6" data-testid="tickets-page">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Ticket Management</h1>
          <p className="text-muted-foreground">Track and manage support tickets</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600" data-testid="create-ticket-button">
              <Plus size={18} className="mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="ticket-dialog" className="bg-card border-border text-foreground" onCloseAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Ticket</DialogTitle>
              <DialogDescription className="text-muted-foreground">Fill in the details to create a new support ticket.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  data-testid="ticket-title-input"
                  className="bg-background border-input text-foreground"
                  placeholder="VLEPO/Internet/Waas Issue - Site X - 20/11/2025"
                />
              </div>

              {/* FIX 5: Site Selection Dropdown with Search */}
              <div className="space-y-2">
                <Label htmlFor="site" className="text-foreground">Site Name</Label>
                <SiteCombobox
                  sites={sites}
                  value={formData.site_id}
                  onChange={(val) => setFormData({ ...formData, site_id: val })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  data-testid="ticket-description-input"
                  className="bg-background border-input text-foreground"
                  placeholder="Detail issue di site"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger className="bg-background border-input text-foreground" data-testid="priority-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Assign To Division</Label>
                  <Select value={formData.assigned_to_division} onValueChange={(value) => setFormData({ ...formData, assigned_to_division: value })}>
                    <SelectTrigger className="bg-background border-input text-foreground" data-testid="division-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="Monitoring">Monitoring</SelectItem>
                      <SelectItem value="Infra">Infra</SelectItem>
                      <SelectItem value="TS">TS</SelectItem>
                      <SelectItem value="Internal Support">Internal Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-500 hover:bg-red-600" data-testid="submit-ticket-button">
                  Create Ticket
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Minimalist Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
        {/* Left: Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-input hover:border-ring focus:border-primary rounded-full transition-colors text-foreground"
            data-testid="ticket-search-input"
          />
        </div>

        {/* Right: Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Site Filter */}
          <div className="w-full md:w-[180px]">
            <SiteFilterCombobox
              sites={sites}
              value={siteFilter}
              onChange={setSiteFilter}
            />
          </div>

          {/* REGIONAL: Region Filter */}
          <div className="w-full md:w-[150px]">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full bg-background border-input rounded-lg hover:bg-accent text-foreground" data-testid="region-filter-select">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Region 1">Region 1</SelectItem>
                <SelectItem value="Region 2">Region 2</SelectItem>
                <SelectItem value="Region 3">Region 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[150px] bg-background border-input rounded-lg hover:bg-accent text-foreground" data-testid="sort-select">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter - Segmented Control */}
          <div className="flex bg-secondary/50 p-1 rounded-lg border border-border">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                statusFilter === 'all'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                statusFilter === 'active'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Active
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table View */}
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow className="hover:bg-muted/50 border-b border-border">
              <TableHead className="w-[300px] text-muted-foreground font-medium">Ticket Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Site</TableHead>
              <TableHead className="text-muted-foreground font-medium">Assign To</TableHead>
              <TableHead className="text-muted-foreground font-medium">Date</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Priority</TableHead>
              <TableHead className="text-right text-muted-foreground font-medium pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {tickets.length === 0 ? 'No tickets created yet' : 'No tickets match your search'}
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="hover:bg-muted/50 border-b border-border group"
                >
                  <TableCell className="font-medium">
                    <div
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="flex items-center space-x-2 cursor-pointer hover:underline text-foreground"
                    >
                      <span className="font-bold text-primary">{ticket.title}</span>
                    </div>
                    {ticket.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[280px] mt-1">
                        {ticket.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {ticket.site_name || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-normal border-transparent", getDivisionColor(ticket.assigned_to_division))}>
                      {ticket.assigned_to_division}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("min-w-[80px] justify-center shadow-none", getStatusColor(ticket.status))}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("min-w-[70px] justify-center shadow-none border bg-transparent",
                      ticket.priority === 'High' ? "text-red-600 border-red-200 dark:border-red-800" :
                        ticket.priority === 'Medium' ? "text-yellow-600 border-yellow-200 dark:border-yellow-800" :
                          "text-green-600 border-green-200 dark:border-green-800"
                    )}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tickets/${ticket.id}`);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit Ticket"
                    >
                      <Pencil size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalTickets > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalTickets)} of {totalTickets} tickets
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

export default Tickets;
