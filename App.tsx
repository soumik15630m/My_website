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
import { OpenSourceDetail } from './components/OpenSourceDetail';
import { ParticleField } from './components/ParticleField';
import { useContent } from './hooks/useContent';
import { ViewState, Project, Achievement, Note, OpenSourceContribution } from './types';
import { GitPullRequest, Star, ExternalLink, Search, X, ChevronDown, Clock, ArrowUpDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  // Dynamic content from API (falls back to constants)
  const { profile, projects, achievements, notes, opensource, navItems, loading } = useContent();

  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedOSS, setSelectedOSS] = useState<OpenSourceContribution | null>(null);
  const [direction, setDirection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'oldest' | 'readTime' | 'title'>('date');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

            {/* Open Source Glance Section */}
            {opensource.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                className="border-t border-border pt-12"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-mono text-secondaryText uppercase tracking-widest opacity-60">Open Source Contributions</h3>
                  <button
                    onClick={() => handleViewChange('opensource')}
                    className="text-xs font-mono text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                  >
                    View all <ExternalLink size={12} />
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {opensource.slice(0, 4).map((contrib) => (
                    <a
                      key={contrib.id}
                      href={contrib.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent/30 transition-all duration-300 hover:bg-white/8"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <GitPullRequest size={16} className="text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primaryText truncate group-hover:text-accent transition-colors">{contrib.title}</p>
                          <p className="text-xs text-secondaryText/60 mt-1">{contrib.repo} #{contrib.prNumber}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

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

            <ScrollTrigger nextSection="Open Source" onClick={() => handleViewChange('opensource')} />
          </div>
        );

      case 'notes':
        // Extract all unique tags from notes
        const allTags: string[] = Array.from(new Set(notes.flatMap(n => n.tags)));

        // Filter notes based on search and selected tags
        const filteredNotes = notes.filter(note => {
          const matchesSearch = searchQuery === '' ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

          const matchesTags = selectedTags.length === 0 ||
            selectedTags.some(tag => note.tags.includes(tag));

          return matchesSearch && matchesTags;
        });

        // Sort filtered notes
        const sortedNotes = [...filteredNotes].sort((a, b) => {
          switch (sortBy) {
            case 'date':
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            case 'oldest':
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            case 'readTime':
              return parseInt(a.readTime) - parseInt(b.readTime);
            case 'title':
              return a.title.localeCompare(b.title);
            default:
              return 0;
          }
        });

        // Autocomplete suggestions
        const autocompleteSuggestions = searchQuery.length > 0
          ? notes
            .filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5)
          : [];

        const toggleTag = (tag: string) => {
          setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
          );
        };

        const selectAutocomplete = (title: string) => {
          setSearchQuery(title);
          setShowAutocomplete(false);
        };

        return (
          <div className="max-w-4xl mx-auto">
            <Section className="mb-8 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-semibold text-primaryText mb-4 tracking-tight">Writings</h2>
              <p className="text-lg text-secondaryText font-light max-w-2xl leading-relaxed mx-auto md:mx-0">
                Technical explorations and deep dives.
              </p>
            </Section>

            {/* Search & Sort Bar */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-3">
                {/* Search Input with Autocomplete */}
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryText/40" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search writings..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowAutocomplete(true);
                    }}
                    onFocus={() => setShowAutocomplete(true)}
                    onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                    className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-primaryText placeholder-secondaryText/40 focus:outline-none focus:border-accent/50 transition-colors font-mono text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-secondaryText/40 hover:text-primaryText transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}

                  {/* Autocomplete Dropdown */}
                  {showAutocomplete && autocompleteSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                      {autocompleteSuggestions.map(note => (
                        <button
                          key={note.id}
                          onClick={() => selectAutocomplete(note.title)}
                          className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          <p className="text-sm text-primaryText truncate">{note.title}</p>
                          <p className="text-xs text-secondaryText/40 mt-0.5">{note.tags.slice(0, 3).join(' • ')}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'oldest' | 'readTime' | 'title')}
                    className="appearance-none px-4 py-3 pr-10 bg-surface border border-white/10 rounded-xl text-secondaryText font-mono text-sm focus:outline-none focus:border-accent/50 transition-colors cursor-pointer [&>option]:bg-surface [&>option]:text-primaryText"
                  >
                    <option value="date">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="readTime">Quick reads</option>
                    <option value="title">A-Z</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText/40 pointer-events-none" />
                </div>
              </div>

              {/* Skills Filter Section */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-secondaryText/40 uppercase tracking-wider">Filter by skills</span>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all duration-200 ${selectedTags.includes(tag)
                        ? 'bg-accent/20 border-accent/50 text-accent'
                        : 'bg-white/5 border-white/10 text-secondaryText/60 hover:border-white/20 hover:text-secondaryText'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-xs font-mono px-3 py-1.5 text-secondaryText/40 hover:text-secondaryText transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Container */}
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              {/* Results count */}
              <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-secondaryText/40">
                  {sortedNotes.length} {sortedNotes.length === 1 ? 'article' : 'articles'}
                </span>
                {(searchQuery || selectedTags.length > 0) && (
                  <span className="text-xs font-mono text-accent/60">filtered</span>
                )}
              </div>

              {/* Scrollable Notes List */}
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-4 space-y-3"
                >
                  {sortedNotes.length > 0 ? (
                    sortedNotes.map((note, index) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        index={index}
                        onClick={() => setSelectedNote(note)}
                      />
                    ))
                  ) : (
                    <div className="py-16 text-center">
                      <p className="text-secondaryText/40 font-mono text-sm">No articles match your search.</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            <ScrollTrigger
              nextSection="End"
              onClick={() => handleViewChange('home')}
            />
          </div>
        );

      case 'opensource':
        return (
          <div className="max-w-5xl mx-auto">
            <Section className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
                  Open Source
                </h2>
                <p className="text-secondaryText text-lg max-w-2xl">
                  Contributing to projects that power millions of developers. Here are some of my merged pull requests.
                </p>
              </div>

              <div className="space-y-4 pt-8">
                {opensource.map((contrib, index) => (
                  <motion.div
                    key={contrib.id}
                    onClick={() => setSelectedOSS(contrib)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex flex-col md:flex-row md:items-center gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-accent/30 transition-all duration-300 hover:bg-white/8 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <GitPullRequest size={20} className="text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primaryText group-hover:text-accent transition-colors">{contrib.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-secondaryText/60">{contrib.repo}</span>
                          <span className="text-secondaryText/30">•</span>
                          <span className="text-sm text-secondaryText/60">#{contrib.prNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {contrib.labels?.map((label) => (
                        <span key={label} className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                          {label}
                        </span>
                      ))}
                      <span className="text-xs text-secondaryText/40">{contrib.date}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">
                        {contrib.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>

            <ScrollTrigger nextSection="Recognition" onClick={() => handleViewChange('achievements')} />
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

        <AnimatePresence>
          {selectedOSS && (
            <OpenSourceDetail
              contribution={selectedOSS}
              onClose={() => setSelectedOSS(null)}
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