import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

// DEPARTMENT: Division options per department
const DEPARTMENT_DIVISIONS = {
  'Technical Operation': ['Monitoring', 'Infra', 'TS', 'Apps', 'Fiberzone', 'Admin', 'Internal Support'],
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    department: 'Technical Operation',  // DEPARTMENT: Default value
    division: 'Monitoring',
    role: 'Staff',
    region: ''  // REGIONAL: Required for non-VP roles
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email domain
    const email = formData.email.toLowerCase();
    if (!email.endsWith('@varnion.net.id') && !email.endsWith('@fiberzone.id')) {
      toast.error('Only @varnion.net.id and @fiberzone.id email addresses are allowed');
      return;
    }

    // DEPARTMENT: Validate all 4 required fields
    if (!formData.department) {
      toast.error('Department is required');
      return;
    }
    if (!formData.division) {
      toast.error('Division is required');
      return;
    }
    if (!formData.role) {
      toast.error('Role is required');
      return;
    }

    // REGIONAL: Validate region requirement for non-VP roles
    if (formData.role !== 'VP' && !formData.region) {
      toast.error('Region is required');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-foreground">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <img src="/logo.png" alt="Flux" className="w-full h-full object-contain rounded-xl shadow-sm" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join Flux today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
            <div className="space-y-2">
              <Label htmlFor="username">Nama Lengkap</Label>
              <Input
                id="username"
                placeholder="Michael Jordan"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                data-testid="username-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Michael@varnion.net.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                data-testid="password-input"
              />
            </div>

            {/* DEPARTMENT: Department Field - First */}
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => {
                  // Reset division to the first valid option for the new department
                  const divisions = DEPARTMENT_DIVISIONS[value] || [];
                  setFormData({
                    ...formData,
                    department: value,
                    division: divisions[0] || '',
                    role: 'Staff' // Reset role since division changed
                  });
                }}
              >
                <SelectTrigger data-testid="department-select">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical Operation">Technical Operation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Division Field - Options depend on Department */}
            <div className="space-y-2">
              <Label>Divisi *</Label>
              <Select
                value={formData.division}
                onValueChange={(value) => {
                  // Auto-set role to Staff for Apps and Fiberzone
                  if (value === 'Apps' || value === 'Fiberzone') {
                    setFormData({ ...formData, division: value, role: 'Staff' });
                  } else if (value === 'Admin') {
                    // Pre-select VP for Admin division
                    setFormData({ ...formData, division: value, role: 'VP' });
                  } else {
                    setFormData({ ...formData, division: value });
                  }
                }}
                disabled={!formData.department}
              >
                <SelectTrigger data-testid="division-select">
                  <SelectValue placeholder="Select Divisi" />
                </SelectTrigger>
                <SelectContent>
                  {(DEPARTMENT_DIVISIONS[formData.department] || []).map((div) => (
                    <SelectItem key={div} value={div}>{div}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Field - Now Second */}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={formData.division === 'Apps' || formData.division === 'Fiberzone'}
              >
                <SelectTrigger data-testid="role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="SPV">SPV</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  {formData.division === 'Admin' && <SelectItem value="VP">VP</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* REGIONAL: Region Field */}
            <div className="space-y-2">
              <Label>Region *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData({ ...formData, region: value })}
              >
                <SelectTrigger data-testid="region-select">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Region 1">Region 1</SelectItem>
                  <SelectItem value="Region 2">Region 2</SelectItem>
                  <SelectItem value="Region 3">Region 3</SelectItem>
                </SelectContent>
              </Select>
              {!formData.region && (
                <p className="text-xs text-destructive">Region is required</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-lg"
              disabled={loading}
              data-testid="register-button"
            >
              {loading ? 'Creating account...' : (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-semibold" data-testid="login-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
