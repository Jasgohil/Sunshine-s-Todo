import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Sun, ArrowRight, Loader2 } from 'lucide-react';

// Form validation schema using Zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0D0D0D] text-foreground select-none overflow-hidden font-sans">
      
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

        {/* Brand Quote / Image Center */}
        <div className="my-auto max-w-md space-y-6 z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.1] text-sunshine-textNearWhite"
          >
            Leave room for a little <span className="bg-gradient-to-r from-sunshine-gold to-sunshine-orange bg-clip-text text-transparent">sunshine</span> in your day.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-sm text-sunshine-textMuted leading-relaxed"
          >
            Sunshine's Todo helps you organize your daily schedules, focus on what matters with Pomodoro timers, and capture precious moments in your private mood journal.
          </motion.p>

          {/* Interactive glass card mockup preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="p-6 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-md relative overflow-hidden group shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="text-[10px] font-semibold text-sunshine-gold px-2 py-0.5 rounded-full bg-sunshine-gold/10 border border-sunshine-gold/20">
                Focus Goal
              </div>
            </div>
            <p className="text-xs text-sunshine-textNearWhite font-serif italic">
              "Deep focus on styling the auth flow. Make it look absolute luxury."
            </p>
            <div className="mt-4 flex items-center justify-between text-[10px] text-sunshine-textMuted border-t border-border/30 pt-3">
              <span>Duration: 25 min</span>
              <span className="text-sunshine-orange">Status: Active</span>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-xs text-sunshine-textMuted z-10">
          © {new Date().getFullYear()} Sunshine's Todo. All rights reserved.
        </div>
      </div>

      {/* Column 2: Sign-In Form Panel (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        {/* Subtle top glow for mobile view */}
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] rounded-full bg-radial-gradient from-sunshine-gold/5 via-transparent to-transparent pointer-events-none blur-3xl"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] space-y-8"
        >
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-black tracking-tight text-sunshine-textNearWhite">
              Welcome back
            </h2>
            <p className="text-sm text-sunshine-textMuted">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Form Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sunshine-textMuted" size={16} />
                <input
                  type="email"
                  disabled={isLoading}
                  placeholder="name@example.com"
                  {...register('email')}
                  className={`w-full h-12 pl-10 pr-4 rounded-xl bg-card border ${
                    errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-sunshine-gold'
                  } text-sm text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:ring-1 ${
                    errors.email ? 'focus:ring-red-500/30' : 'focus:ring-sunshine-gold/30'
                  } transition-all duration-200`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-bold text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-sunshine-gold hover:text-sunshine-orange transition-colors duration-150"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sunshine-textMuted" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full h-12 pl-10 pr-12 rounded-xl bg-card border ${
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
                <p className="text-[10px] font-bold text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                disabled={isLoading}
                {...register('rememberMe')}
                className="w-4.5 h-4.5 rounded border-border bg-card text-sunshine-gold focus:ring-sunshine-gold/30 focus:ring-1 cursor-pointer accent-sunshine-gold"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2.5 text-xs text-sunshine-textNearWhite font-medium cursor-pointer"
              >
                Keep me signed in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange hover:from-sunshine-gold hover:to-sunshine-orange text-sunshine-darkBg font-black text-sm tracking-wide shadow-lg shadow-sunshine-gold/20 flex items-center justify-center gap-2 hover:shadow-sunshine-gold/30 transition-all duration-300 transform active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-xs text-sunshine-textMuted">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-sunshine-gold hover:text-sunshine-orange transition-colors duration-150 underline decoration-dotted"
            >
              Sign Up
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
