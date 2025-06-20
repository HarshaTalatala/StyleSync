import { useState, useEffect, useCallback } from 'react';
import { FaCog, FaUserCircle, FaSignOutAlt, FaLock, FaBell, FaPalette, FaArrowLeft, FaInfoCircle } from 'react-icons/fa'; 
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const Settings = () => {
  const { currentUser, logout, updatePassword } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    privacyMode: false,
    language: 'en'
  });
  
  const [profile, setProfile] = useState({
    displayName: '',
    photoURL: ''
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
    const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('profile');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false
  });

  const fetchUserSettings = useCallback(async () => {
    if (!currentUser) return;
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      const docSnap = await getDoc(userSettingsRef);
      if (docSnap.exists()) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...docSnap.data()
        }));
      } else {
        await setDoc(userSettingsRef, settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ text: 'Failed to load settings', type: 'error' });
      toast.error('Failed to load settings');
    }
  }, [currentUser, settings]);

  useEffect(() => {
    if (currentUser) {
      setProfile({
        displayName: currentUser.displayName || currentUser.email.split('@')[0],
        photoURL: currentUser.photoURL || ''
      });
      fetchUserSettings();
    }
  }, [currentUser, fetchUserSettings]);

  const updateUserProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profile.displayName.trim(),
          photoURL: profile.photoURL
        });
      }
      const userProfileRef = doc(db, 'userProfiles', currentUser.uid);
      await setDoc(userProfileRef, profile, { merge: true });
      setMessage({ text: 'Profile updated successfully', type: 'success' });
      toast.success('Profile updated successfully!');
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: `Failed to update profile: ${error.message}`, type: 'error' });
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateUserSettings = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      await setDoc(userSettingsRef, newSettings, { merge: true });
      toast.success('Setting updated!');
    } catch (error) {
      setMessage({ text: `Failed to update setting: ${error.message}`, type: 'error' });
      toast.error(`Failed to update setting: ${error.message}`);
      fetchUserSettings();
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePassword(passwords.newPassword);
      toast.success('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ text: `Failed to update password: ${error.message}`, type: 'error' });
      toast.error(`Failed to update password: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleLogoutRequest = () => {
    setConfirmDialog({
      isOpen: true
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col bg-slate-50 overflow-auto">
      <div className="max-w-5xl mx-auto w-full py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 shadow-sm transition-colors mr-4"
              title="Back to Dashboard"
            >
              <FaArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-3xl font-light text-slate-800 flex items-center">
                <span className="text-indigo-600 font-medium">Settings</span>
                <FaCog className="text-indigo-500 ml-3" />
              </h1>
              <p className="text-slate-500 mt-1">Manage your account preferences and settings</p>
            </div>
          </div>
        </div>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg shadow-sm border ${
            message.type === 'error' 
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-green-50 text-green-700 border-green-200'
          } animate-fade-in`}>
            {message.text}
          </div>
        )}
        
        <div className="bg-white rounded-t-xl shadow-sm border border-slate-200 mb-1">
          <div className="flex">
            {['profile', 'account', 'preferences'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-medium text-sm flex-1 transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-indigo-600 border-t-2 border-t-indigo-600 shadow-inner-top' 
                    : 'bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-b-xl shadow-md border border-slate-200 p-6 md:p-8">
          {activeTab === 'profile' && (
            <form onSubmit={updateUserProfile} className="space-y-6 max-w-2xl">
              <div className="flex items-center mb-6 pb-2 border-b border-slate-100">
                <div className="bg-indigo-100 rounded-full p-2 mr-4">
                  <FaUserCircle className="text-indigo-600 text-xl" />
                </div>
                <h2 className="text-xl font-medium text-slate-700">Profile Information</h2>
              </div>
              
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={currentUser?.email}
                      disabled
                      className="w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg shadow-inner"
                    />
                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                      <FaInfoCircle className="mr-1" /> Email cannot be changed
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-3 px-6 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Updating...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
          
          {activeTab === 'account' && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <div className="flex items-center mb-6 pb-2 border-b border-slate-100">
                  <div className="bg-indigo-100 rounded-full p-2 mr-4">
                    <FaLock className="text-indigo-600 text-xl" />
                  </div>
                  <h2 className="text-xl font-medium text-slate-700">Security</h2>
                </div>
                
                <form onSubmit={handlePasswordChange} className="space-y-5 bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                        autoComplete="current-password"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                        autoComplete="new-password"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                      autoComplete="new-password"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`py-3 px-6 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
                <div className="pt-4 border-t border-slate-200">
                <h3 className="font-medium text-slate-700 mb-4">Account Actions</h3>
                <button
                  onClick={handleLogoutRequest}
                  className="flex items-center space-x-2 py-3 px-6 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                >
                  <FaSignOutAlt className="text-red-500" /> <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Confirm Dialog for Logout */}
          <ConfirmDialog 
            isOpen={confirmDialog.isOpen}
            onClose={() => setConfirmDialog({...confirmDialog, isOpen: false})}
            onConfirm={handleLogout}
            title="Sign Out"
            message="Are you sure you want to sign out of your account?"
          />
          
          {activeTab === 'preferences' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center mb-6 pb-2 border-b border-slate-100">
                <div className="bg-indigo-100 rounded-full p-2 mr-4">
                  <FaPalette className="text-indigo-600 text-xl" />
                </div>
                <h2 className="text-xl font-medium text-slate-700">App Preferences</h2>
              </div>
              
              <div className="space-y-1 divide-y divide-slate-100">
                <div className="flex justify-between items-center py-5">
                  <div>
                    <h3 className="font-medium text-slate-800">Notifications</h3>
                    <p className="text-sm text-slate-500">Enable or disable app notifications</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => updateUserSettings('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex justify-between items-center py-5">
                  <div>
                    <h3 className="font-medium text-slate-800">Privacy Mode</h3>
                    <p className="text-sm text-slate-500">Hide sensitive wardrobe information</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacyMode}
                      onChange={(e) => updateUserSettings('privacyMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex justify-between items-center py-5">
                  <div>
                    <h3 className="font-medium text-slate-800">Language</h3>
                    <p className="text-sm text-slate-500">Choose your preferred language</p>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => updateUserSettings('language', e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm text-slate-700"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;