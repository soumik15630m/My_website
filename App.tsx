import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { Section } from './components/Section';
import { ProjectCard } from './components/ProjectCard';
import { ProjectFlow } from './components/ProjectFlow';
import { NoteCard } from './components/NoteCard';
import { AchievementItem } from './components/AchievementItem';
import { TimelineDot } from './components/TimelineDot';
import { TimelineTrail } from './components/TimelineTrail';
import { ScrollTrigger } from './components/ScrollTrigger';
import { AchievementDetail } from './components/AchievementDetail';
import { NoteDetail } from './components/NoteDetail';
import { ParticleField } from './components/ParticleField';
import { useContent } from './hooks/useContent';
import { ViewState, Project, Achievement, Note } from './types';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  // Dynamic content from API (falls back to constants)
  const { profile, projects, achievements, notes, navItems, loading } = useContent();

  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [direction, setDirection] = useState(0);

  // Use a ref for the lock to ensure instant access inside event listeners without closure staleness
  const isTransitioningRef = useRef(false);

  // Helper to determine order
  const VIEW_ORDER: ViewState[] = navItems.map(n => n.id);

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
          <div className="space-y-24 max-w-5xl mx-auto min-h-[80vh]">
            <Section className="space-y-16 py-12 md:py-20 text-center md:text-left">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-primaryText leading-[0.95] mx-auto md:mx-0 max-w-4xl">
                <motion.span
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
                  className="block"
                >
                  {profile.role || 'Systems Engineer'}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                  className="block text-secondaryText"
                >
                  {profile.tagline || 'crafting zero-cost abstractions.'}
                </motion.span>
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                className="flex flex-col md:flex-row gap-12 md:gap-24 border-t border-border pt-12 items-start justify-between"
              >
                <div className="max-w-xl text-left">
                  <h3 className="text-xs font-mono text-secondaryText uppercase tracking-widest mb-6 opacity-60">About</h3>
                  <p className="text-lg md:text-xl text-primaryText/90 leading-relaxed font-light">
                    {profile.about}
                  </p>
                </div>
                <div className="flex flex-col gap-8 text-left min-w-[200px]">
                  <div>
                    <h3 className="text-xs font-mono text-secondaryText uppercase tracking-widest mb-2 opacity-60">Location</h3>
                    <p className="text-primaryText font-medium">{profile.location}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-mono text-secondaryText uppercase tracking-widest mb-2 opacity-60">Status</h3>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                      </span>
                      <p className="text-accent font-medium">{profile.availability}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Section>

            <ScrollTrigger
              nextSection="Selected Work"
              onClick={() => handleViewChange('projects')}
            />
          </div>
        );

      case 'projects':
        return (
          <div className="max-w-5xl mx-auto relative">
            {/* === DECORATIVE ELEMENTS === */}
            {/* Floating Ambient Orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {/* Top-right accent orb */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-[100px]"
              />
              {/* Bottom-left accent orb */}
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  x: [0, 10, 0],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]"
              />
              {/* Small floating accent */}
              <motion.div
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/3 right-0 w-2 h-2 rounded-full bg-accent/40"
              />
            </div>

            {/* Grid Pattern Overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(138, 180, 248, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(138, 180, 248, 0.5) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />

            {/* Section Header with decorative line */}
            <Section className="mb-20 text-center md:text-left relative">
              {/* Decorative corner accent */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-accent/20 rounded-tl-lg hidden md:block" />

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                className="h-[2px] bg-gradient-to-r from-accent to-transparent mb-8 hidden md:block"
              />

              <h2 className="text-4xl md:text-5xl font-semibold text-primaryText mb-6 tracking-tight">
                Selected Work
              </h2>
              <p className="text-xl text-secondaryText font-light max-w-2xl leading-relaxed mx-auto md:mx-0">
                Architecting high-concurrency systems, optimizing distributed databases, and building developer tools.
              </p>

              {/* Stats/metrics accent */}
              <div className="flex gap-8 mt-8 text-center md:text-left">
                <div>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold text-accent"
                  >
                    {projects.length}
                  </motion.span>
                  <p className="text-xs font-mono text-secondaryText/60 uppercase tracking-widest mt-1">Projects</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-3xl font-bold text-primaryText"
                  >
                    {projects.filter(p => p.status === 'active').length}
                  </motion.span>
                  <p className="text-xs font-mono text-secondaryText/60 uppercase tracking-widest mt-1">Active</p>
                </div>
              </div>
            </Section>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-16 relative z-10 md:ml-32"
            >
              {/* Global Timeline Trail - fills continuously as you scroll */}
              <TimelineTrail />

              {projects.map((project, index) => (
                <TimelineDot key={project.id} index={index}>
                  <ProjectCard
                    project={project}
                    onOpen={setSelectedProject}
                    index={index}
                    total={projects.length}
                  />
                </TimelineDot>
              ))}
            </motion.div>

            <ScrollTrigger nextSection="Recognition" onClick={() => handleViewChange('achievements')} />
          </div>
        );

      case 'achievements':
        return (
          <div className="max-w-3xl mx-auto">
            <Section className="mb-20 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-semibold text-primaryText mb-6 tracking-tight">Recognition</h2>
              <p className="text-xl text-secondaryText font-light max-w-2xl leading-relaxed mx-auto md:mx-0">
                Validation through competition and community contribution.
              </p>
            </Section>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {achievements.map((achievement, index) => (
                <AchievementItem
                  key={achievement.id}
                  achievement={achievement}
                  index={index}
                  onClick={() => setSelectedAchievement(achievement)}
                />
              ))}
            </motion.div>

            <ScrollTrigger nextSection="Engineering Log" onClick={() => handleViewChange('notes')} />
          </div>
        );

      case 'notes':
        return (
          <div className="max-w-3xl mx-auto">
            <Section className="mb-20 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-semibold text-primaryText mb-6 tracking-tight">Engineering Log</h2>
              <p className="text-xl text-secondaryText font-light max-w-2xl leading-relaxed mx-auto md:mx-0">
                Technical deep dives into specific problem spaces.
              </p>
            </Section>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {notes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={index}
                  onClick={() => setSelectedNote(note)}
                />
              ))}
            </motion.div>

            {/* End of content - no next section, or loop back? Usually nothing or "Back to Top" */}
            <div className="h-32 flex items-center justify-center opacity-30">
              <span className="font-mono text-xs">EOF</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-primaryText font-sans selection:bg-accent/20 selection:text-accent overflow-x-hidden">
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
      </main>

      {/* Particle Field - Background Layer */}
      <ParticleField />

    </div>
  );
}

export default App;