import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { UserCheck, Check, X, Users, Trash2, Shield, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';

const API = `${process.env.REACT_APP_API_URL}/api`;

const DEPARTMENT_DIVISIONS = {
  'Technical Operation': ['Monitoring', 'Infra', 'TS', 'Apps', 'Fiberzone', 'Admin', 'Internal Support'],
};

const AccountManagement = () => {
  const { user } = useAuth();
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'users'
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    role: '',
    department: '',
    division: '',
    region: '',
    account_status: ''
  });
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    fetchPendingAccounts();
    if (user?.role === 'SuperUser' || user?.role === 'VP') {
      fetchAllUsers();
    }
  }, [user]);

  const fetchPendingAccounts = async () => {
    try {
      const response = await axios.get(`${API}/accounts/pending`);
      setPendingAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch pending accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      // VPs should not see SuperUsers even if they are in the same department
      if (user?.role === 'VP') {
        setAllUsers(response.data.filter(u => u.role !== 'SuperUser'));
      } else {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleReview = async (userId, action) => {
    try {
      await axios.post(`${API}/accounts/review`, {
        user_id: userId,
        action: action
      });
      toast.success(`Account ${action}d successfully!`);
      fetchPendingAccounts();
    } catch (error) {
      toast.error(error.response?.data?.detail || `Failed to ${action} account`);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API}/users/${userId}`);
      toast.success('User deleted successfully!');
      fetchAllUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      role: user.role,
      department: user.department || '',
      division: user.division || '',
      region: user.region || '',
      account_status: user.account_status || 'approved'
    });
    setIsEditOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/users/${editingUser.id}`, editFormData);
      toast.success('User updated successfully!');
      setIsEditOpen(false);
      setEditingUser(null);
      fetchAllUsers(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'SuperUser': 'bg-purple-100 text-purple-800 border-purple-200',
      'VP': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Manager': 'bg-gray-700/50 text-gray-200 border-gray-600',
      'SPV': 'bg-green-100 text-green-800 border-green-200',
      'Staff': 'bg-secondary text-secondary-foreground border-border'
    };
    return colors[role] || 'bg-secondary text-secondary-foreground';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="account-management-page">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Account Management</h1>
        <p className="text-muted-foreground">
          {user?.role === 'SuperUser'
            ? 'Manage user accounts and approve registrations'
            : `Review and approve pending staff registrations${user?.role === 'Manager' ? ` for ${user.division} division` : ''}`
          }
        </p>
      </div>

      {/* Tabs for SuperUser and VP */}
      {(user?.role === 'SuperUser' || user?.role === 'VP') && (
        <div className="flex space-x-2 border-b pb-2">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('pending')}
            className={activeTab === 'pending' ? 'bg-gray-600' : ''}
          >
            <UserCheck size={18} className="mr-2" />
            Pending Approvals ({pendingAccounts.length})
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'bg-gray-600' : ''}
          >
            <Users size={18} className="mr-2" />
            All Users ({allUsers.length})
          </Button>
        </div>
      )}

      {/* Pending Accounts Tab */}
      {(activeTab === 'pending' || user?.role !== 'SuperUser') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingAccounts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <UserCheck size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No pending account approvals</p>
            </div>
          ) : (
            pendingAccounts.map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500" data-testid={`account-card-${account.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{account.username}</CardTitle>
                  <CardDescription className="text-sm">
                    {account.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-semibold text-slate-300">Department:</p>
                      <p className="text-foreground">{account.department || '-'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-300">Division:</p>
                      <p className="text-foreground">{account.division}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-300">Role:</p>
                      <p className="text-foreground">{account.role}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-300">Region:</p>
                      <p className="text-foreground">{account.region || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-300 text-sm">Status:</p>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      {account.account_status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Registered: {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleReview(account.id, 'approve')}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      data-testid={`approve-${account.id}`}
                    >
                      <Check size={16} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReview(account.id, 'reject')}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      data-testid={`reject-${account.id}`}
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* All Users Tab (SuperUser and VP) */}
      {activeTab === 'users' && (user?.role === 'SuperUser' || user?.role === 'VP') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allUsers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No users found</p>
            </div>
          ) : (
            allUsers.map((u) => (
              <Card key={u.id} className="hover:shadow-lg transition-shadow" data-testid={`user-card-${u.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {u.username}
                        {u.role === 'SuperUser' && <Shield size={16} className="text-purple-500" />}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {u.email}
                      </CardDescription>
                    </div>
                    {u.id !== user.id && u.role !== 'SuperUser' && (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(u)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          data-testid={`edit-user-${u.id}`}
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          data-testid={`delete-user-${u.id}`}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getRoleBadgeColor(u.role)}>
                      {u.role}
                    </Badge>
                    {u.department && (
                      <Badge variant="outline" className="border-blue-300 text-blue-600">{u.department}</Badge>
                    )}
                    {u.division && (
                      <Badge variant="outline">{u.division}</Badge>
                    )}
                  </div>
                  <div>
                    <Badge
                      className={u.account_status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {u.account_status || 'approved'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit User: {editingUser?.username}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update user role and division.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Role</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                disabled={editFormData.division === 'Apps' || editFormData.division === 'Fiberzone'}
              >
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="SPV">SPV</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="VP">VP</SelectItem>
                  {user?.role === 'SuperUser' && <SelectItem value="SuperUser">SuperUser</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Department</Label>
              <Select
                value={editFormData.department}
                onValueChange={(value) => {
                  const divisions = DEPARTMENT_DIVISIONS[value] || [];
                  const newDivision = divisions.includes(editFormData.division)
                    ? editFormData.division
                    : (divisions[0] || '');
                  setEditFormData({ ...editFormData, department: value, division: newDivision });
                }}
              >
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="Technical Operation">Technical Operation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Division</Label>
              <Select
                value={editFormData.division}
                onValueChange={(value) => {
                  if (value === 'Apps' || value === 'Fiberzone') {
                    setEditFormData({ ...editFormData, division: value, role: 'Staff' });
                  } else if (value === 'Admin') {
                    setEditFormData({ ...editFormData, division: value, role: 'VP' });
                  } else {
                    setEditFormData({ ...editFormData, division: value });
                  }
                }}
                disabled={!editFormData.department}
              >
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  {(DEPARTMENT_DIVISIONS[editFormData.department] || []).map((div) => (
                    <SelectItem key={div} value={div}>{div}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Region</Label>
              <Select
                value={editFormData.region}
                onValueChange={(value) => setEditFormData({ ...editFormData, region: value })}
              >
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="Region 1">Region 1</SelectItem>
                  <SelectItem value="Region 2">Region 2</SelectItem>
                  <SelectItem value="Region 3">Region 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Account Status</Label>
              <Select
                value={editFormData.account_status}
                onValueChange={(value) => setEditFormData({ ...editFormData, account_status: value })}
              >
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="border-border text-foreground hover:bg-accent">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-500 hover:bg-green-600">
                Update User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountManagement;
