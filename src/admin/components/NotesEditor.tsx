import React, { useState } from 'react';
import { Plus, Save, ChevronDown, Search, X, ChevronUp } from 'lucide-react';
import { Input } from './ui/Input';
import { CollapsibleItem } from './ui/CollapsibleItem';
import { JsonImportSection } from './JsonImportSection';
import { NOTE_TEMPLATE } from './templates';

interface NotesEditorProps {
    notes: any[];
    onChange: (notes: any[]) => void;
    onSave: () => void;
    saving: boolean;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({ notes, onChange, onSave, saving }) => {
    const addNote = () => {
        onChange([
            ...notes,
            {
                id: `n${Date.now()}`,
                title: '',
                summary: '',
                date: new Date().toISOString().split('T')[0],
                tags: [],
                readTime: '5 min',
                imageUrl: '',
            },
        ]);
    };

    const updateNote = (index: number, updates: any) => {
        const newNotes = [...notes];
        newNotes[index] = { ...newNotes[index], ...updates };
        onChange(newNotes);
    };

    const removeNote = (index: number) => {
        onChange(notes.filter((_: any, i: number) => i !== index));
    };

    const scrollToBottom = () => {
        const container = document.getElementById('notes-container');
        container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    };

    const scrollToTop = () => {
        const container = document.getElementById('notes-container');
        container?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotes = notes.filter((n: any) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            n.title?.toLowerCase().includes(query) ||
            n.summary?.toLowerCase().includes(query) ||
            n.tags?.some((tag: string) => tag.toLowerCase().includes(query))
        );
    });

    const getOriginalIndex = (item: any) => notes.findIndex((n: any) => n.id === item.id || n === item);

    return (
        <div id="notes-container" className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {/* Top Action Bar */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-4 border-b border-border space-y-4">
                <div className="flex gap-4 flex-wrap">
                    <button onClick={addNote} className="flex items-center gap-2 px-4 py-2 border border-border text-secondaryText rounded-lg hover:bg-surface hover:text-primaryText transition-colors">
                        <Plus size={18} />
                        Add Note
                    </button>
                    <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save All'}
                    </button>
                    {notes.length > 2 && (
                        <button
                            onClick={scrollToBottom}
                            className="flex items-center gap-1 px-3 py-2 text-secondaryText hover:text-primaryText transition-colors ml-auto"
                        >
                            <ChevronDown size={18} />
                            Scroll Down
                        </button>
                    )}
                </div>

                <JsonImportSection
                    itemName="Notes"
                    template={NOTE_TEMPLATE}
                    onImport={(items) => onChange([...notes, ...items])}
                />

                {/* Search */}
                {notes.length > 0 && (
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, summary, or tags..."
                            className="w-full pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-primaryText text-sm placeholder:text-secondaryText/50 focus:outline-none focus:border-accent transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText hover:text-primaryText"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {searchQuery && filteredNotes.length === 0 && (
                <div className="text-center py-8 text-secondaryText">No notes match "{searchQuery}"</div>
            )}

            {filteredNotes.map((note: any) => {
                const index = getOriginalIndex(note);
                return (
                    <CollapsibleItem
                        key={note.id || index}
                        title={note.title || `Note ${index + 1}`}
                        subtitle={note.date || note.summary}
                        isNew={!note.title}
                        onDelete={() => removeNote(index)}
                    >
                        <Input label="Title" value={note.title} onChange={(v: string) => updateNote(index, { title: v })} />
                        <Input label="Summary" value={note.summary} onChange={(v: string) => updateNote(index, { summary: v })} multiline />
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Date" value={note.date} onChange={(v: string) => updateNote(index, { date: v })} placeholder="YYYY-MM-DD" />
                            <Input label="Read Time" value={note.readTime} onChange={(v: string) => updateNote(index, { readTime: v })} placeholder="5 min" />
                            <Input
                                label="Tags (comma-separated)"
                                value={Array.isArray(note.tags) ? note.tags.join(', ') : note.tags}
                                onChange={(v: string) => updateNote(index, { tags: v.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                            />
                        </div>
                        <Input label="Featured Image URL" value={note.image} onChange={(v: string) => updateNote(index, { image: v })} placeholder="https://..." />
                        <div className="space-y-1.5">
                            <label className="text-sm text-secondaryText">Gallery Images (one URL per line)</label>
                            <textarea
                                value={Array.isArray(note.images) ? note.images.join('\n') : ''}
                                onChange={(e) => updateNote(index, { images: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) })}
                                placeholder="https://image1.jpg&#10;https://image2.jpg&#10;https://image3.jpg"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-primaryText text-sm placeholder:text-secondaryText/30 focus:outline-none focus:border-accent transition-colors resize-none"
                                rows={3}
                            />
                        </div>
                    </CollapsibleItem>
                );
            })}

            {/* Bottom Scroll Up */}
            {notes.length > 2 && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-1 px-4 py-2 text-secondaryText hover:text-primaryText border border-border rounded-lg transition-colors"
                    >
                        <ChevronUp size={18} />
                        Scroll to Top
                    </button>
                </div>
            )}
        </div>
    );
};
