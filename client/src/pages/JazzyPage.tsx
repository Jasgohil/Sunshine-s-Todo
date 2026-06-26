import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Quote, Calendar, Star, Send } from 'lucide-react';
import api from '../utils/api';

// Default pool of rotating poems
const defaultPoems = [
  {
    title: 'Hope is the thing with feathers',
    content: 'Hope is the thing with feathers\nThat perches in the soul,\nAnd sings the tune without the words,\nAnd never stops at all,\n\nAnd sweetest in the gale is heard;\nAnd sore must be the storm\nThat could abash the little bird\nThat kept so many warm.',
    author: 'Emily Dickinson',
  },
  {
    title: 'A Red, Red Rose',
    content: 'O my Luve is like a red, red rose\nThat’s newly sprung in June;\nO my Luve is like the melody\nThat’s sweetly played in tune.\n\nSo fair art thou, my bonnie lass,\nSo deep in luve am I;\nAnd I will luve thee still, my dear,\nTill a’ the seas gang dry.',
    author: 'Robert Burns',
  },
  {
    title: 'The Guest House',
    content: 'This being human is a guest house.\nEvery morning a new arrival.\n\nA joy, a depression, a meanness,\nsome momentary awareness comes\nas an unexpected visitor.\n\nWelcome and entertain them all!',
    author: 'Rumi',
  }
];

// Default pool of rotating daily heartfelt messages
const defaultMessages = [
  "You are capable of doing amazing things, even on the days when it feels like just getting out of bed is a victory. Take a deep breath and take one tiny step forward. You've got this, Sunshine! ❤️",
  "Don't compare your chapter one to someone else's chapter twenty. Everyone moves at their own pace, and where you are right now is exactly where you need to be. Be gentle with yourself today.",
  "Remember that the clouds always pass, and the sun always returns. If today is a bit gray, hold on, because your sunshine is just behind the horizon. Keep shining your light!",
  "A quiet mind is a powerful mind. Take five minutes today to just sit, breathe, and appreciate how far you have come. I am so proud of your progress and who you are becoming."
];

const JazzyPage: React.FC = () => {
  const [dailyMessage, setDailyMessage] = useState('');
  const [dailyPoem, setDailyPoem] = useState<typeof defaultPoems[0]>(defaultPoems[0]);
  const [handwrittenNote, setHandwrittenNote] = useState('');

  // Fetch daily messages, custom scheduled notes, and poems from backend
  useEffect(() => {
    // 1. Fetch Daily Message & Custom Scheduled Note
    api.get('/jazzy/daily')
      .then((res) => {
        const data = res.data;
        if (data.isCustom) {
          // Custom scheduled handwritten letter from Jazzy
          setHandwrittenNote(data.content);
          
          // Re-calculate local fallback for rotating daily message card
          const fallbackMessages = [
            "You are capable of doing amazing things, even on the days when it feels like just getting out of bed is a victory. Take a deep breath and take one tiny step forward. You've got this, Sunshine! ❤️",
            "Don't compare your chapter one to someone else's chapter twenty. Everyone moves at their own pace, and where you are right now is exactly where you need to be. Be gentle with yourself today.",
            "Remember that the clouds always pass, and the sun always returns. If today is a bit gray, hold on, because your sunshine is just behind the horizon. Keep shining your light!",
            "A quiet mind is a powerful mind. Take five minutes today to just sit, breathe, and appreciate how far you have come. I am so proud of your progress and who you are becoming."
          ];
          const today = new Date();
          const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
          setDailyMessage(fallbackMessages[dayOfYear % fallbackMessages.length]);
        } else {
          // Standard rotating daily message
          setDailyMessage(data.content);
          // Fallback default handwritten letter
          setHandwrittenNote("Hey there! Just wanted to send you a little reminder to stay hydrated, stretch your back, and take a 5-minute breather. You are doing so well, and I hope your day is filled with little moments of joy. Always cheering for you!\n\nWith love,\nJazzy ❤️");
        }
      })
      .catch((err) => {
        console.error('Failed to fetch daily note:', err);
      });

    // 2. Fetch Daily Poem
    api.get('/jazzy/poem')
      .then((res) => {
        setDailyPoem(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch daily poem:', err);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto select-none pb-16 relative">
      
      {/* Soft warm animated aurora backgrounds in the backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }}
          className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[120px]"
        ></motion.div>
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
          className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full bg-rose-500/5 blur-[120px]"
        ></motion.div>
      </div>

      <div className="relative z-10 space-y-8">
        
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400">
            <Heart size={22} className="animate-pulse fill-rose-500/20" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-sunshine-textNearWhite tracking-tight">
              Jazzy's Corner
            </h1>
            <p className="text-xs text-sunshine-textMuted mt-0.5">
              Heartfelt daily messages, handwritten reminders, and inspiring literature.
            </p>
          </div>
        </div>

        {/* Grid: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Column 1: Daily Message & Daily Poem */}
          <div className="space-y-8">
            
            {/* 1. Daily Message Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-card border border-border/60 relative overflow-hidden group shadow-2xl hover:border-sunshine-gold/20 transition-all duration-300"
            >
              {/* Glowing star decoration */}
              <div className="absolute top-4 right-4 text-sunshine-gold/30 group-hover:text-sunshine-gold group-hover:rotate-45 transition-all duration-500">
                <Star size={16} className="fill-sunshine-gold/10" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sunshine-gold uppercase tracking-wider">
                  <Quote size={14} className="fill-sunshine-gold/10" />
                  <span>Daily Heartfelt Message</span>
                </div>
                
                {/* Message Body */}
                <motion.p
                  animate={{ scale: [1, 1.01, 1] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                  className="text-sm font-semibold text-sunshine-textNearWhite/90 leading-relaxed font-serif"
                >
                  "{dailyMessage}"
                </motion.p>

                <div className="flex items-center justify-between text-[10px] text-sunshine-textMuted font-bold pt-3 border-t border-border/20">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-sunshine-orange flex items-center gap-1">
                    <Sparkles size={10} /> ROTATES DAILY
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 2. Today's Poem Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 rounded-3xl bg-card/60 border border-border/40 backdrop-blur-md relative overflow-hidden shadow-xl hover:border-rose-500/20 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                  <Heart size={12} className="fill-rose-500/10" />
                  <span>Today's Poetry Choice</span>
                </div>

                {/* Poem Details */}
                <div className="text-center space-y-4 py-2">
                  <h3 className="text-sm font-black text-sunshine-textNearWhite tracking-wide font-serif underline decoration-rose-500/20 underline-offset-4">
                    {dailyPoem.title}
                  </h3>
                  <p className="text-xs text-sunshine-textNearWhite/90 leading-relaxed italic whitespace-pre-line font-serif">
                    {dailyPoem.content}
                  </p>
                  <span className="text-[10px] text-sunshine-textMuted font-extrabold uppercase tracking-widest block">
                    — {dailyPoem.author}
                  </span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Column 2: Slightly Tilted Handwritten Note */}
          <motion.div
            initial={{ opacity: 0, rotate: 0, y: 20 }}
            animate={{ opacity: 1, rotate: 1.5, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.25 }}
            className="p-8 rounded-3xl bg-[#FFFDF0] border border-[#EBE7D3] text-[#2F2D23] shadow-2xl relative overflow-hidden transform group select-none min-h-[420px] flex flex-col justify-between"
          >
            {/* Lined paper texture effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(47,45,35,0.04)_1px,transparent_1px)] [background-size:100%_24px] pointer-events-none opacity-60"></div>
            
            {/* Red left margin line of notebook paper */}
            <div className="absolute left-7 top-0 bottom-0 w-[1px] bg-red-500/30 pointer-events-none"></div>

            {/* Note Content */}
            <div className="pl-6 space-y-4 z-10 font-serif leading-relaxed text-sm md:text-base">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#7F7B6B] uppercase tracking-widest border-b border-[#EBE7D3] pb-2">
                <span>Personal Note from Jazzy</span>
              </div>
              
              <p className="whitespace-pre-line font-medium leading-[24px] text-zinc-800">
                {handwrittenNote}
              </p>
            </div>

            {/* Bottom decoration */}
            <div className="pl-6 pt-6 flex items-center justify-between z-10 border-t border-[#EBE7D3]/40 text-[10px] font-bold text-[#7F7B6B]">
              <span className="flex items-center gap-1">
                <Heart size={10} className="fill-red-500 text-red-500" />
                MADE WITH LOVE
              </span>
              <span>SUNSHINE OFFICE</span>
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
};

export default JazzyPage;
