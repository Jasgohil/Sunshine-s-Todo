import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Lock,
  Bell,
  Eye,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Validation schemas
const infoSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ['confirmPassword'],
});

type InfoFormValues = z.infer<typeof infoSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [avatarSeed, setAvatarSeed] = useState(user?.displayName || 'Sunshine');

  // Toggle states
  const [dailyReminders, setDailyReminders] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(true);
  const [focusAlerts, setFocusAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Forms
  const {
    register: registerInfo,
    handleSubmit: handleInfoSubmit,
    formState: { errors: infoErrors },
  } = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Handle Info Update
  const onInfoSubmit = async (data: InfoFormValues) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      // Generate a new random avatar seed if they changed their name to make it fun!
      const seed = data.displayName;
      const photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
      
      await updateProfile(data.displayName, photoURL);
      setAvatarSeed(seed);
      setSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg('Failed to update profile.');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await changePassword(data.newPassword);
      setSuccessMsg('Password changed successfully!');
      resetPassword();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to change password. You may need to re-login.');
    }
  };

  // Generate a random cute avatar seed to trigger avatar change mockup!
  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`;
    if (user) {
      updateProfile(user.displayName, photoURL);
      setSuccessMsg('Avatar updated! (mock upload complete)');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto select-none pb-16 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-sunshine-textNearWhite tracking-tight">
          Profile & Account Settings
        </h1>
        <p className="text-xs text-sunshine-textMuted mt-0.5">
          Manage display name, password credentials, and notification triggers.
        </p>
      </div>

      {/* Dynamic Alert Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Avatar Card & Info Panel (1 Column) */}
        <div className="md:col-span-1 bg-card border border-border/60 rounded-3xl p-6 flex flex-col items-center text-center space-y-6">
          <span className="text-xs font-bold text-sunshine-textMuted tracking-wider uppercase">
            Your Avatar
          </span>

          {/* Avatar frame with hover overlay */}
          <div className="relative group cursor-pointer" onClick={handleRandomizeAvatar}>
            <img
              src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`}
              alt="Profile Avatar"
              className="w-28 h-28 rounded-3xl border-2 border-border group-hover:border-sunshine-gold bg-[#121212] object-cover shadow-xl transition-all duration-300 transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-sunshine-gold text-[10px] font-bold gap-1">
              <Camera size={18} />
              <span>RANDOMIZE</span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-sunshine-textNearWhite">
              {user?.displayName}
            </h3>
            <span className="text-xs text-sunshine-textMuted block truncate max-w-[180px]">
              {user?.email}
            </span>
            {user?.isAdmin && (
              <span className="inline-block mt-2 text-[9px] bg-red-500/10 text-red-400 font-extrabold tracking-widest px-2.5 py-0.5 rounded-full border border-red-500/20 uppercase">
                ADMINISTRATOR
              </span>
            )}
          </div>

          <p className="text-[10px] text-sunshine-textMuted leading-relaxed max-w-[200px] border-t border-border/40 pt-4">
            Click your avatar to randomize a new robot seed. Mock upload persists in local storage.
          </p>
        </div>

        {/* Right Columns: Forms (2 Columns) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section 1: Personal Info Form */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide border-b border-border/30 pb-3">
              <UserIcon size={14} className="text-sunshine-gold" />
              <span>Personal Information</span>
            </div>

            <form onSubmit={handleInfoSubmit(onInfoSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sunshine-textMuted tracking-wider uppercase">
                    Display Name
                  </label>
                  <input
                    type="text"
                    {...registerInfo('displayName')}
                    className={`w-full h-11 px-4 rounded-xl bg-[#121212] border ${
                      infoErrors.displayName ? 'border-red-500' : 'border-border'
                    } text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold`}
                  />
                  {infoErrors.displayName && (
                    <p className="text-[10px] font-bold text-red-400 mt-1">{infoErrors.displayName.message}</p>
                  )}
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-1.5 opacity-60">
                  <label className="text-[10px] font-bold text-sunshine-textMuted tracking-wider uppercase">
                    Email Address (Read-Only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F0F0F] border border-border text-xs text-sunshine-textNearWhite focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-xs tracking-wide shadow-md shadow-sunshine-gold/10 flex items-center justify-center gap-2 hover:shadow-sunshine-gold/20 transition-all duration-300 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Security Password Form */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide border-b border-border/30 pb-3">
              <Lock size={14} className="text-sunshine-orange" />
              <span>Change Password</span>
            </div>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-sunshine-textMuted tracking-wider uppercase">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('currentPassword')}
                  className={`w-full h-11 px-4 rounded-xl bg-[#121212] border ${
                    passwordErrors.currentPassword ? 'border-red-500' : 'border-border'
                  } text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold`}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-[10px] font-bold text-red-400 mt-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sunshine-textMuted tracking-wider uppercase">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('newPassword')}
                    className={`w-full h-11 px-4 rounded-xl bg-[#121212] border ${
                      passwordErrors.newPassword ? 'border-red-500' : 'border-border'
                    } text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-[10px] font-bold text-red-400 mt-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sunshine-textMuted tracking-wider uppercase">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('confirmPassword')}
                    className={`w-full h-11 px-4 rounded-xl bg-[#121212] border ${
                      passwordErrors.confirmPassword ? 'border-red-500' : 'border-border'
                    } text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold`}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-[10px] font-bold text-red-400 mt-1">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-xs tracking-wide shadow-md shadow-sunshine-gold/10 flex items-center justify-center gap-2 hover:shadow-sunshine-gold/20 transition-all duration-300 cursor-pointer"
                >
                  <Lock size={14} />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Notification & Appearance Settings (Switches) */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide border-b border-border/30 pb-3">
              <Bell size={14} className="text-teal-400" />
              <span>Preferences & Notifications</span>
            </div>

            <div className="space-y-4">
              
              {/* Toggle 1: Daily reminders */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121212] border border-border/40">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-sunshine-textNearWhite block">Daily Reminders</span>
                  <span className="text-[10px] text-sunshine-textMuted">Send morning task schedules and alerts.</span>
                </div>
                <input
                  type="checkbox"
                  checked={dailyReminders}
                  onChange={(e) => setDailyReminders(e.target.checked)}
                  className="w-4.5 h-4.5 text-sunshine-gold bg-[#121212] border-border rounded cursor-pointer accent-sunshine-gold"
                />
              </div>

              {/* Toggle 2: Event reminders */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121212] border border-border/40">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-sunshine-textNearWhite block">Calendar Event Alerts</span>
                  <span className="text-[10px] text-sunshine-textMuted">Send notifications 15 minutes before calendar events.</span>
                </div>
                <input
                  type="checkbox"
                  checked={eventAlerts}
                  onChange={(e) => setEventAlerts(e.target.checked)}
                  className="w-4.5 h-4.5 text-sunshine-gold bg-[#121212] border-border rounded cursor-pointer accent-sunshine-gold"
                />
              </div>

              {/* Toggle 3: Focus reminders */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121212] border border-border/40">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-sunshine-textNearWhite block">Focus Session Sounds</span>
                  <span className="text-[10px] text-sunshine-textMuted">Play alarm chime when Pomodoro countdown completes.</span>
                </div>
                <input
                  type="checkbox"
                  checked={focusAlerts}
                  onChange={(e) => setFocusAlerts(e.target.checked)}
                  className="w-4.5 h-4.5 text-sunshine-gold bg-[#121212] border-border rounded cursor-pointer accent-sunshine-gold"
                />
              </div>

              {/* Toggle 4: Appearance */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121212] border border-border/40">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} className="text-sunshine-gold" />
                    <span className="text-xs font-bold text-sunshine-textNearWhite block">Dark Mode Default</span>
                  </div>
                  <span className="text-[10px] text-sunshine-textMuted">Keep application background default dark charcoal.</span>
                </div>
                <input
                  type="checkbox"
                  disabled
                  checked={darkMode}
                  className="w-4.5 h-4.5 text-sunshine-gold bg-[#121212] border-border rounded cursor-not-allowed accent-sunshine-gold"
                />
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
