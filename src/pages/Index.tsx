import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import SmoothScroll from '@/components/landing/SmoothScroll';
import HeroSection from '@/components/landing/HeroSection';
import BeachSection from '@/components/landing/BeachSection';
import { useImagePreloader } from '@/hooks/useImagePreloader';

const LoadingScreen = ({ progress }: { progress: number }) => (
  <motion.div
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8, ease: 'easeInOut' }}
  >
    <motion.h1
      className="text-4xl md:text-6xl font-light tracking-[0.3em] uppercase text-white mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      Travel Buddy
    </motion.h1>

    {/* Progress bar */}
    <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-white/80"
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'linear' }}
      />
    </div>

    <motion.p
      className="mt-4 text-xs tracking-[0.4em] uppercase text-white/40 font-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      Loading Experience
    </motion.p>
  </motion.div>
);

const Index = () => {
  // Preload sequence 1 to show loading screen until ready
  const { loaded: seq1Loaded, progress: seq1Progress } = useImagePreloader('/sequences/seq1', 120);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#050505]">
        {/* Loading screen */}
        <AnimatePresence mode="wait">
          {!seq1Loaded && <LoadingScreen progress={seq1Progress} />}
        </AnimatePresence>

        {/* Navbar (transparent on landing, handled inside Navbar) */}
        <Navbar />

        {/* Cinematic sections */}
        {seq1Loaded && (
          <>
            <HeroSection />
            <BeachSection />
          </>
        )}
      </div>
    </SmoothScroll>
  );
};

export default Index;
