import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Plus, AlertCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_API_URL}/api`;

const Tickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assigned_to_division: 'Monitoring'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API}/tickets`);
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/tickets`, formData);
      toast.success('Ticket created successfully!');
      setOpen(false);
      fetchTickets();
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        assigned_to_division: 'Monitoring'
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create ticket');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-green-100 text-green-800 border-green-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      High: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDivisionColor = (division) => {
    const colors = {
      'Monitoring': 'bg-blue-500',
      'Infra': 'bg-purple-500',
      'TS & Apps': 'bg-green-500'
    };
    return colors[division] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6" data-testid="tickets-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Tickets</h1>
          <p className="text-slate-600">Manage internal issue cases and assignments</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600" data-testid="create-ticket-button">
              <Plus size={18} className="mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="ticket-dialog">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  data-testid="ticket-title-input"
                  placeholder="e.g., Site X Down, Server Issues"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  data-testid="ticket-description-input"
                  placeholder="Detailed description of the issue..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger data-testid="priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assign To Division</Label>
                <Select value={formData.assigned_to_division} onValueChange={(value) => setFormData({ ...formData, assigned_to_division: value })}>
                  <SelectTrigger data-testid="division-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monitoring">Monitoring</SelectItem>
                    <SelectItem value="Infra">Infra</SelectItem>
                    <SelectItem value="TS & Apps">TS & Apps</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No tickets created yet
          </div>
        ) : (
          tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="hover:shadow-lg transition-all cursor-pointer border-l-4"
              style={{ borderLeftColor: getDivisionColor(ticket.assigned_to_division).replace('bg-', '#').replace('500', '') }}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              data-testid={`ticket-card-${ticket.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-start space-x-2">
                    <AlertCircle size={20} className="text-red-500 mt-1 flex-shrink-0" />
                    <span>{ticket.title}</span>
                  </CardTitle>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  By {ticket.created_by_name} • {ticket.assigned_to_division}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>

                {ticket.comments && ticket.comments.length > 0 && (
                  <p className="text-xs text-slate-500">
                    {ticket.comments.length} comment{ticket.comments.length !== 1 ? 's' : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Tickets;
