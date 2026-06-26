import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Sun, ArrowRight, Loader2, Check } from 'lucide-react';

// Form validation schema using Zod
const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [strengthColor, setStrengthColor] = useState('bg-transparent');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  // Calculate password strength in real-time
  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength(0);
      setStrengthLabel('');
      setStrengthColor('bg-transparent');
      return;
    }

    let score = 0;
    if (passwordValue.length >= 6) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;

    setPasswordStrength(score);

    switch (score) {
      case 1:
        setStrengthLabel('Weak');
        setStrengthColor('bg-red-500');
        break;
      case 2:
        setStrengthLabel('Fair');
        setStrengthColor('bg-orange-500');
        break;
      case 3:
        setStrengthLabel('Good');
        setStrengthColor('bg-yellow-500');
        break;
      case 4:
        setStrengthLabel('Strong');
        setStrengthColor('bg-green-500');
        break;
      default:
        setStrengthLabel('');
        setStrengthColor('bg-transparent');
    }
  }, [passwordValue]);

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);
    setToast(null);
    try {
      await registerUser(data.name, data.email, data.password);
      setToast({
        type: 'success',
        message: 'Account created successfully! Welcome to Sunshine!',
      });
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      const errMsg = err?.message || 'Something went wrong. Please try again.';
      setError(errMsg);
      setToast({
        type: 'error',
        message: errMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0D0D0D] text-foreground select-none overflow-hidden font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md max-w-sm"
            style={{
              backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
              color: toast.type === 'success' ? '#10B981' : '#EF4444',
            }}
          >
            <div
              className="p-1.5 rounded-lg flex items-center justify-center font-bold"
              style={{
                backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              }}
            >
              {toast.type === 'success' ? (
                <Check size={18} strokeWidth={2.5} />
              ) : (
                <span className="text-sm px-1">!</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider">
                {toast.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className="text-xs text-sunshine-textNearWhite mt-0.5 font-medium leading-tight">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-sunshine-textMuted hover:text-sunshine-textNearWhite transition-colors text-xs font-semibold px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Column 1: Decorative Brand Panel (Left) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#121212] flex-col justify-between p-12 overflow-hidden border-r border-border">
        {/* Ambient Glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-radial-gradient from-sunshine-gold/10 via-transparent to-transparent pointer-events-none blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-radial-gradient from-sunshine-orange/10 via-transparent to-transparent pointer-events-none blur-3xl"></div>
        
        {/* Brand logo */}
        <div className="flex items-center gap-3 text-sunshine-gold z-10">
          <div className="p-2.5 bg-sunshine-gold/10 rounded-2xl border border-sunshine-gold/20 flex items-center justify-center">
            <Sun className="h-6 w-6 animate-pulse text-sunshine-gold" />
          </div>
          <span className="text-xl font-black tracking-widest bg-gradient-to-r from-sunshine-gold to-sunshine-orange bg-clip-text text-transparent">
            SUNSHINE
          </span>
        </div>

        {/* Brand Quote / Content Center */}
        <div className="my-auto max-w-md space-y-6 z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.1] text-sunshine-textNearWhite"
          >
            Start your journey to a more <span className="bg-gradient-to-r from-sunshine-gold to-sunshine-orange bg-clip-text text-transparent">focused</span> life.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-sm text-sunshine-textMuted leading-relaxed"
          >
            Creating an account takes less than a minute. Sign up now to get full access to custom nested task trees, interactive weekly calendars, circular pomodoro timers, and private mood-based journal entries.
          </motion.p>

          {/* Interactive Check List Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="p-6 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-md relative overflow-hidden shadow-2xl space-y-3"
          >
            <div className="flex items-center gap-3 text-xs text-sunshine-textNearWhite">
              <div className="w-5 h-5 rounded-full bg-sunshine-gold/10 border border-sunshine-gold/30 flex items-center justify-center text-sunshine-gold">
                <Check size={10} strokeWidth={3} />
              </div>
              <span>Custom nested tasks and checklists</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-sunshine-textNearWhite">
              <div className="w-5 h-5 rounded-full bg-sunshine-gold/10 border border-sunshine-gold/30 flex items-center justify-center text-sunshine-gold">
                <Check size={10} strokeWidth={3} />
              </div>
              <span>Structured Pomodoro timer & daily statistics</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-sunshine-textNearWhite">
              <div className="w-5 h-5 rounded-full bg-sunshine-gold/10 border border-sunshine-gold/30 flex items-center justify-center text-sunshine-gold">
                <Check size={10} strokeWidth={3} />
              </div>
              <span>Rich text editor for journaling with mood tracking</span>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-xs text-sunshine-textMuted z-10">
          © {new Date().getFullYear()} Sunshine's Todo. All rights reserved.
        </div>
      </div>

      {/* Column 2: Sign-Up Form Panel (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] rounded-full bg-radial-gradient from-sunshine-gold/5 via-transparent to-transparent pointer-events-none blur-3xl"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] space-y-6 py-8"
        >
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-black tracking-tight text-sunshine-textNearWhite">
              Create an account
            </h2>
            <p className="text-sm text-sunshine-textMuted">
              Let's get you set up with your productivity workspace.
            </p>
          </div>

          {/* Form Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sunshine-textMuted" size={16} />
                <input
                  type="text"
                  disabled={isLoading}
                  placeholder="John Doe"
                  {...register('name')}
                  className={`w-full h-11 pl-10 pr-4 rounded-xl bg-card border ${
                    errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-sunshine-gold'
                  } text-sm text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:ring-1 ${
                    errors.name ? 'focus:ring-red-500/30' : 'focus:ring-sunshine-gold/30'
                  } transition-all duration-200`}
                />
              </div>
              {errors.name && (
                <p className="text-[10px] font-bold text-red-400 mt-0.5">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sunshine-textMuted" size={16} />
                <input
                  type="email"
                  disabled={isLoading}
                  placeholder="name@example.com"
                  {...register('email')}
                  className={`w-full h-11 pl-10 pr-4 rounded-xl bg-card border ${
                    errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-sunshine-gold'
                  } text-sm text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:ring-1 ${
                    errors.email ? 'focus:ring-red-500/30' : 'focus:ring-sunshine-gold/30'
                  } transition-all duration-200`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-bold text-red-400 mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sunshine-textMuted" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full h-11 pl-10 pr-12 rounded-xl bg-card border ${
                    errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-sunshine-gold'
                  } text-sm text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:ring-1 ${
                    errors.password ? 'focus:ring-red-500/30' : 'focus:ring-sunshine-gold/30'
                  } transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sunshine-textMuted hover:text-sunshine-textNearWhite transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] font-bold text-red-400 mt-0.5">{errors.password.message}</p>
              )}

              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className="pt-2 space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-wide uppercase">
                    <span className="text-sunshine-textMuted">Password Strength</span>
                    <span
                      className={`${
                        passwordStrength === 1 ? 'text-red-500' :
                        passwordStrength === 2 ? 'text-orange-500' :
                        passwordStrength === 3 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}
                    >
                      {strengthLabel}
                    </span>
                  </div>
                  {/* Visual segment bars */}
                  <div className="grid grid-cols-4 gap-1.5 h-1">
                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`h-full rounded-full transition-all duration-300 ${
                          index <= passwordStrength ? strengthColor : 'bg-border'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sunshine-textMuted" size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={`w-full h-11 pl-10 pr-12 rounded-xl bg-card border ${
                    errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-sunshine-gold'
                  } text-sm text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:ring-1 ${
                    errors.confirmPassword ? 'focus:ring-red-500/30' : 'focus:ring-sunshine-gold/30'
                  } transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sunshine-textMuted hover:text-sunshine-textNearWhite transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] font-bold text-red-400 mt-0.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange hover:from-sunshine-gold hover:to-sunshine-orange text-sunshine-darkBg font-black text-sm tracking-wide shadow-lg shadow-sunshine-gold/20 flex items-center justify-center gap-2 hover:shadow-sunshine-gold/30 transition-all duration-300 transform active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <p className="text-xs text-center text-sunshine-textMuted pt-4 border-t border-border/30">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-sunshine-gold hover:text-sunshine-orange transition-colors duration-150"
            >
              Sign in instead
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
