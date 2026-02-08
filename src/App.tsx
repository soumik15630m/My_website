import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { ProjectFlow } from './components/ProjectFlow';
import { AchievementDetail } from './components/AchievementDetail';
import { NoteDetail } from './components/NoteDetail';
import { OpenSourceDetail } from './components/OpenSourceDetail';
import { useContent } from './hooks/useContent';
import { ViewState, Project, Achievement, Note, OpenSourceContribution } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { ParticleField } from './components/ParticleField';
import { LoadingScreen } from './components/LoadingScreen';

// Import Sections
import { HomeSection } from './components/sections/HomeSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { AchievementsSection } from './components/sections/AchievementsSection';
import { NotesSection } from './components/sections/NotesSection';
import { OpenSourceSection } from './components/sections/OpenSourceSection';

function App() {
  // Dynamic content from API (falls back to constants)
  const { profile, projects, achievements, notes, opensource, settings, navItems, loading } = useContent();

  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedOSS, setSelectedOSS] = useState<OpenSourceContribution | null>(null);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Use a ref for the lock to ensure instant access inside event listeners without closure staleness
  const isTransitioningRef = useRef(false);

  // Helper to determine order
  const VIEW_ORDER: ViewState[] = navItems.map(n => n.id);

  useEffect(() => {
    // Simulate minimum loading time for premium feel
    // BUT also wait for content to be ready
    const timer = setTimeout(() => {
      // Only set to false if content is also ready (handled by derived state below)
      setIsMinLoadComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const [isMinLoadComplete, setIsMinLoadComplete] = useState(false);
  const showLoading = !isMinLoadComplete || loading;

  const handleViewChange = useCallback((newView: ViewState) => {
    if (newView === currentView) return;
    const newIndex = VIEW_ORDER.indexOf(newView);
    const currentIndex = VIEW_ORDER.indexOf(currentView);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentView(newView);

    // Lock transitions for animation duration (reduced for 0.8s transition)
    isTransitioningRef.current = true;
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 800);
  }, [currentView, VIEW_ORDER]);

  // Scroll Boundary Detection for "Google Flow" page switching
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If locked, do nothing
      if (isTransitioningRef.current) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Calculate closeness to bottom (using a safer buffer of 50px)
      const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 50;
      const isAtTop = scrollTop <= 0;

      // Threshold: Ignore tiny trackpad jitters, but allow lighter swipes
      if (Math.abs(e.deltaY) < 10) return;

      if (e.deltaY > 0 && isAtBottom) {
        // Scrolling Down at Bottom -> Next Section
        const idx = VIEW_ORDER.indexOf(currentView);
        if (idx < VIEW_ORDER.length - 1) {
          handleViewChange(VIEW_ORDER[idx + 1]);
        }
      } else if (e.deltaY < 0 && isAtTop) {
        // Scrolling Up at Top -> Prev Section
        const idx = VIEW_ORDER.indexOf(currentView);
        if (idx > 0) {
          handleViewChange(VIEW_ORDER[idx - 1]);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentView, handleViewChange, VIEW_ORDER]);

  // Reset scroll position when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioningRef.current) return;

      if (e.key === 'Escape' && currentView !== 'home') {
        handleViewChange('home');
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const idx = VIEW_ORDER.indexOf(currentView);
        if (idx < VIEW_ORDER.length - 1) handleViewChange(VIEW_ORDER[idx + 1]);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const idx = VIEW_ORDER.indexOf(currentView);
        if (idx > 0) handleViewChange(VIEW_ORDER[idx - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, handleViewChange, VIEW_ORDER]);

  // Stagger settings for lists
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Vertical slide variants (Google Flow style)
  const pageVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '100vh' : '-100vh',
      opacity: 0,
      scale: 0.95,
      filter: 'blur(8px)',
      zIndex: 1
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      zIndex: 2,
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 30,
        mass: 1
      }
    },
    exit: (direction: number) => ({
      y: direction > 0 ? '-100vh' : '100vh',
      opacity: 0,
      scale: 0.95,
      filter: 'blur(8px)',
      zIndex: 0,
      transition: {
        duration: 0.5,
        ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number]
      }
    })
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeSection
            profile={profile}
            projects={projects}
            opensource={opensource}
            handleViewChange={handleViewChange}
            setSelectedProject={setSelectedProject}
          />
        );

      case 'projects':
        return (
          <ProjectsSection
            projects={projects}
            handleViewChange={handleViewChange}
            setSelectedProject={setSelectedProject}
            containerVariants={containerVariants}
          />
        );

      case 'achievements':
        return (
          <AchievementsSection
            achievements={achievements}
            handleViewChange={handleViewChange}
            setSelectedAchievement={setSelectedAchievement}
            containerVariants={containerVariants}
          />
        );

      case 'notes':
        return (
          <NotesSection
            notes={notes}
            handleViewChange={handleViewChange}
            setSelectedNote={setSelectedNote}
            containerVariants={containerVariants}
          />
        );

      case 'opensource':
        return (
          <OpenSourceSection
            opensource={opensource}
            handleViewChange={handleViewChange}
            setSelectedOSS={setSelectedOSS}
          />
        );
      default:
        return null; // Should handle this appropriately
    }
  };

  return (
    <div className="min-h-screen bg-background text-primaryText font-sans selection:bg-accent/20 selection:text-accent overflow-x-hidden">
      <AnimatePresence mode="wait">
        {showLoading ? (
          <LoadingScreen key="loading" profile={profile} />
        ) : (
          <div key="content">
            <ParticleField />
            <Navigation currentView={currentView} onChangeView={handleViewChange} profile={profile} navItems={navItems} />

            <main className="min-h-screen w-full px-6 pt-32 pb-24 md:px-8 md:pt-40 lg:pt-48">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentView}
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {selectedProject && (
                  <ProjectFlow
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedAchievement && (
                  <AchievementDetail
                    achievement={selectedAchievement}
                    onClose={() => setSelectedAchievement(null)}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedNote && (
                  <NoteDetail
                    note={selectedNote}
                    onClose={() => setSelectedNote(null)}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedOSS && (
                  <OpenSourceDetail
                    contribution={selectedOSS}
                    onClose={() => setSelectedOSS(null)}
                  />
                )}
              </AnimatePresence>
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;