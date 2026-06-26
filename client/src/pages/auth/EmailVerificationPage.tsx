import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Sun, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      // Simulate premium delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setResendStatus('Verification email resent successfully!');
      setCooldown(60);
    } catch (err) {
      setResendStatus('Failed to resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleProceed = () => {
    // Navigate straight to dashboard since they're registered and logged in under our mock flow
    navigate('/');
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
            Verify your email, secure your <span className="bg-gradient-to-r from-sunshine-gold to-sunshine-orange bg-clip-text text-transparent">sunshine</span>.
          </h1>
          
          <p className="text-sm text-sunshine-textMuted leading-relaxed">
            We are dedicated to keeping your personal thoughts, goals, and daily schedules private. Verifying your email address ensures that your account belongs solely to you.
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs text-sunshine-textMuted z-10">
          © {new Date().getFullYear()} Sunshine's Todo. All rights reserved.
        </div>
      </div>

      {/* Column 2: Verification Panel (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] rounded-full bg-radial-gradient from-sunshine-gold/5 via-transparent to-transparent pointer-events-none blur-3xl"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] as any }}
          className="w-full max-w-[420px] text-center space-y-8"
        >
          {/* Animated Envelope and Shield */}
          <div className="flex justify-center relative">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.6 }}
              className="p-5 bg-sunshine-gold/10 rounded-full border border-sunshine-gold/20 text-sunshine-gold"
            >
              <Mail size={44} strokeWidth={1.5} />
            </motion.div>
            <div className="text-green-500 bg-green-500/10 p-2.5 rounded-full border border-green-500/20 absolute bottom-[-10px] right-[130px] md:right-[150px]">
              <ShieldCheck size={18} />
            </div>
          </div>

          {/* Verification Details */}
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-sunshine-textNearWhite tracking-tight">
              Please verify your email
            </h2>
            <p className="text-sm text-sunshine-textMuted leading-relaxed max-w-sm mx-auto">
              We've sent a verification link to your registered email address. Please open the email and click the link to confirm your account and activate your workspace.
            </p>
          </div>

          {/* Success / Warning Message */}
          {resendStatus && (
            <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold animate-fadeIn">
              {resendStatus}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 max-w-xs mx-auto">
            {/* Proceed Button */}
            <button
              onClick={handleProceed}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange hover:from-sunshine-gold hover:to-sunshine-orange text-sunshine-darkBg font-black text-sm tracking-wide shadow-lg shadow-sunshine-gold/20 flex items-center justify-center gap-2 hover:shadow-sunshine-gold/30 transition-all duration-300 transform active:scale-[0.99] cursor-pointer"
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>

            {/* Resend Button */}
            <button
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className={`w-full h-12 rounded-xl bg-card border border-border text-sunshine-textNearWhite hover:text-sunshine-gold hover:border-sunshine-gold font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer ${
                cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isResending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                'Resend Verification Email'
              )}
            </button>
          </div>

          {/* Footer Back to login Link */}
          <p className="text-xs text-sunshine-textMuted">
            Want to use a different email?{' '}
            <Link
              to="/signup"
              className="font-semibold text-sunshine-gold hover:text-sunshine-orange transition-colors duration-150 underline decoration-dotted"
            >
              Sign up again
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
