import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { User, Lock, Star, TrendingUp, MessageSquare } from 'lucide-react';

const API = `${process.env.REACT_APP_API_URL}/api`;

const StarDisplay = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        size={size}
        className={s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}
      />
    ))}
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    telegram_id: user?.telegram_id || ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo || null);
  const [loading, setLoading] = useState(false);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const response = await axios.get(`${API}/users/me/performance`, { params: { year, month } });
      setPerformance(response.data);
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API}/auth/profile`, {
        username: profileData.username,
        telegram_id: profileData.telegram_id
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.put(`${API}/auth/profile`, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });
      toast.success('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!profilePhoto) {
      toast.error('Please select a photo');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('photo', profilePhoto);

    try {
      await axios.post(`${API}/auth/profile/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile photo updated successfully!');
      window.location.reload(); // Reload to update photo in layout
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="profile-page">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and password</p>
      </div>

      {/* Performance Rating Card */}
      <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-400">
            <TrendingUp size={20} />
            <span>Performance Rating</span>
          </CardTitle>
          <CardDescription>Your average report scores from Manager and VP approvals</CardDescription>
        </CardHeader>
        <CardContent>
          {performance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monthly */}
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">This Month</p>
                  {performance.monthly_avg != null ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <StarDisplay rating={performance.monthly_avg} size={20} />
                        <span className="text-2xl font-bold text-yellow-400">{performance.monthly_avg.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{performance.monthly_count} rated report{performance.monthly_count !== 1 ? 's' : ''}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No rated reports this month</p>
                  )}
                </div>
                {/* Yearly */}
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">This Year</p>
                  {performance.yearly_avg != null ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <StarDisplay rating={performance.yearly_avg} size={20} />
                        <span className="text-2xl font-bold text-yellow-400">{performance.yearly_avg.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{performance.yearly_count} rated report{performance.yearly_count !== 1 ? 's' : ''}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No rated reports this year</p>
                  )}
                </div>
              </div>

              {/* Recent Feedback */}
              {performance.recent_feedback && performance.recent_feedback.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <MessageSquare size={14} className="text-muted-foreground" />
                    Recent Feedback
                  </h4>
                  <div className="space-y-2">
                    {performance.recent_feedback.map((fb, idx) => (
                      <div key={idx} className="bg-background/50 rounded-lg p-3 border border-border text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground truncate">{fb.title}</span>
                          {fb.final_score != null && (
                            <div className="flex items-center gap-1 ml-2 shrink-0">
                              <Star size={12} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-bold text-yellow-400">{fb.final_score.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        {fb.manager_notes && (
                          <p className="text-xs text-muted-foreground"><span className="font-medium">Manager:</span> "{fb.manager_notes}"</p>
                        )}
                        {fb.vp_notes && (
                          <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium">VP:</span> "{fb.vp_notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Loading performance data...</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Photo */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User size={20} />
              <span>Profile Photo</span>
            </CardTitle>
            <CardDescription>Upload your profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview.startsWith('data:') ? photoPreview : `data:image/jpeg;base64,${photoPreview}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-white/80" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  data-testid="photo-input"
                />
                <Button
                  onClick={handleUploadPhoto}
                  disabled={loading || !profilePhoto}
                  data-testid="upload-photo-button"
                >
                  Upload Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User size={20} />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ username: e.target.value })}
                  data-testid="username-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram_id">Telegram ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="telegram_id"
                    value={profileData.telegram_id}
                    onChange={(e) => setProfileData({ ...profileData, telegram_id: e.target.value })}
                    placeholder="e.g. 123456789"
                    data-testid="telegram-id-input"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Chat with <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@userinfobot</a> to get your ID.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email}
                  disabled
                  className="bg-muted text-muted-foreground"
                  data-testid="email-input"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={user?.role}
                  disabled
                  className="bg-muted text-muted-foreground"
                  data-testid="role-input"
                />
              </div>

              {user?.division && (
                <div className="space-y-2">
                  <Label htmlFor="division">Division</Label>
                  <Input
                    id="division"
                    value={user.division}
                    disabled
                    className="bg-muted text-muted-foreground"
                    data-testid="division-input"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                data-testid="update-profile-button"
              >
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock size={20} />
              <span>Change Password</span>
            </CardTitle>
            <CardDescription>Update your password for security</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  required
                  data-testid="current-password-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  required
                  minLength={8}
                  data-testid="new-password-input"
                />
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  required
                  data-testid="confirm-password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600"
                data-testid="change-password-button"
              >
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
