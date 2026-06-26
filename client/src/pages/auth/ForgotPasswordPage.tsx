import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Sun, ArrowLeft, Loader2, CheckCircle2, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordReset(data.email);
      setTargetEmail(data.email);
      setIsSent(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send recovery email. Please try again.');
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

        {/* Brand Quote / Content Center */}
        <div className="my-auto max-w-md space-y-6 z-10">
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.1] text-sunshine-textNearWhite">
            Don't worry, we've got you <span className="bg-gradient-to-r from-sunshine-gold to-sunshine-orange bg-clip-text text-transparent">covered</span>.
          </h1>
          
          <p className="text-sm text-sunshine-textMuted leading-relaxed">
            It happens to the best of us. Just enter the email address associated with your account, and we will send you a secure link to reset your password.
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs text-sunshine-textMuted z-10">
          © {new Date().getFullYear()} Sunshine's Todo. All rights reserved.
        </div>
      </div>

      {/* Column 2: Reset Form Panel (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] rounded-full bg-radial-gradient from-sunshine-gold/5 via-transparent to-transparent pointer-events-none blur-3xl"></div>
        
        <div className="w-full max-w-[420px]">
          <AnimatePresence mode="wait">
            {!isSent ? (
              // Form State
              <motion.div
                key="forgot-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="space-y-2 text-center lg:text-left">
                  <h2 className="text-3xl font-black tracking-tight text-sunshine-textNearWhite">
                    Reset your password
                  </h2>
                  <p className="text-sm text-sunshine-textMuted">
                    Enter your email address to receive a recovery link.
                  </p>
                </div>

                {/* Form Error Alert */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange hover:from-sunshine-gold hover:to-sunshine-orange text-sunshine-darkBg font-black text-sm tracking-wide shadow-lg shadow-sunshine-gold/20 flex items-center justify-center gap-2 hover:shadow-sunshine-gold/30 transition-all duration-300 transform active:scale-[0.99] cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Send Recovery Link'
                    )}
                  </button>
                </form>

                {/* Back to Login Link */}
                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs font-bold text-sunshine-textMuted hover:text-sunshine-gold transition-colors duration-150"
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </Link>
                </div>
              </motion.div>
            ) : (
              // Success State
              <motion.div
                key="forgot-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] as any }}
                className="text-center space-y-6"
              >
                {/* Checkmark and Inbox animations */}
                <div className="flex flex-col items-center justify-center relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="p-4 bg-green-500/10 rounded-full border border-green-500/20 text-green-500 mb-2"
                  >
                    <CheckCircle2 size={42} strokeWidth={1.5} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-sunshine-gold bg-sunshine-gold/10 p-3 rounded-full border border-sunshine-gold/20 absolute bottom-[-10px]"
                  >
                    <Inbox size={18} />
                  </motion.div>
                </div>

                <div className="space-y-2 pt-4">
                  <h2 className="text-2xl font-black text-sunshine-textNearWhite">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-sunshine-textMuted leading-relaxed max-w-sm mx-auto">
                    We've sent a recovery link to <span className="text-sunshine-gold font-semibold">{targetEmail}</span>. Please click the link in the email to reset your password.
                  </p>
                </div>

                <div className="pt-4 max-w-sm mx-auto">
                  <Link
                    to="/login"
                    className="w-full h-12 rounded-xl bg-card border border-border text-sunshine-textNearWhite hover:text-sunshine-gold hover:border-sunshine-gold font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    Return to Sign In
                  </Link>
                </div>

                <p className="text-xs text-sunshine-textMuted">
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => setIsSent(false)}
                    className="font-semibold text-sunshine-gold hover:text-sunshine-orange transition-colors duration-150 underline decoration-dotted"
                  >
                    Try again
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
