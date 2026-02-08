import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X, ChevronDown } from 'lucide-react';
import { Section } from '../Section';
import { ScrollTrigger } from '../ScrollTrigger';
import { NoteCard } from '../NoteCard';
import { Note } from '../../types';

interface NotesSectionProps {
    notes: Note[];
    handleViewChange: (view: any) => void;
    setSelectedNote: (note: Note) => void;
    containerVariants: any;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
    notes,
    handleViewChange,
    setSelectedNote,
    containerVariants
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'date' | 'oldest' | 'readTime' | 'title'>('date');
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

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
        setVisibleCount(12); // Reset when filtering
    };

    const selectAutocomplete = (title: string) => {
        setSearchQuery(title);
        setShowAutocomplete(false);
        setVisibleCount(12); // Reset when searching
    };

    // Displayed notes with lazy loading
    const displayedNotes = sortedNotes.slice(0, visibleCount);
    const hasMore = visibleCount < sortedNotes.length;

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
                                setVisibleCount(12); // Reset when searching
                            }}
                            onFocus={() => setShowAutocomplete(true)}
                            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                            className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-primaryText placeholder-secondaryText/40 focus:outline-none focus:border-accent/50 transition-colors font-mono text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setVisibleCount(12); }}
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
                                onClick={() => { setSelectedTags([]); setVisibleCount(12); }}
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
                <div
                    className="max-h-[60vh] overflow-y-auto custom-scrollbar"
                    onScroll={(e) => {
                        const target = e.target as HTMLDivElement;
                        const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
                        // Load more when within 200px of bottom (buffer zone)
                        if (scrollBottom < 200 && hasMore) {
                            setVisibleCount(prev => Math.min(prev + 10, sortedNotes.length));
                        }
                    }}
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="p-4 space-y-3"
                    >
                        {displayedNotes.length > 0 ? (
                            <>
                                {displayedNotes.map((note, index) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        index={index}
                                        onClick={() => setSelectedNote(note)}
                                    />
                                ))}

                                {/* Invisible trigger zone - appears before end for seamless loading */}
                                {hasMore && (
                                    <div
                                        ref={loadMoreRef}
                                        className="h-4 flex items-center justify-center"
                                    >
                                        <span className="text-xs font-mono text-secondaryText/20">loading...</span>
                                    </div>
                                )}
                            </>
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
};
