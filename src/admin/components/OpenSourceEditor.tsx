import React, { useState } from 'react';
import { Plus, Save, ChevronDown, Search, X, ChevronUp } from 'lucide-react';
import { Input } from './ui/Input';
import { CollapsibleItem } from './ui/CollapsibleItem';
import { JsonImportSection } from './JsonImportSection';
import { OPENSOURCE_TEMPLATE } from './templates';

interface OpenSourceEditorProps {
    opensource: any[];
    onChange: (opensource: any[]) => void;
    onSave: () => void;
    saving: boolean;
}

export const OpenSourceEditor: React.FC<OpenSourceEditorProps> = ({ opensource, onChange, onSave, saving }) => {
    const addContribution = () => {
        onChange([
            ...opensource,
            {
                id: `os${Date.now()}`,
                repo: '',
                repoUrl: '',
                title: '',
                prNumber: 0,
                prUrl: '',
                status: 'merged',
                labels: [],
                date: new Date().toISOString().split('T')[0],
                description: '',
            },
        ]);
    };

    const updateContribution = (index: number, updates: any) => {
        const newOpensource = [...opensource];
        newOpensource[index] = { ...newOpensource[index], ...updates };
        onChange(newOpensource);
    };

    const removeContribution = (index: number) => {
        onChange(opensource.filter((_: any, i: number) => i !== index));
    };

    const scrollToBottom = () => {
        const container = document.getElementById('opensource-container');
        container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    };

    const scrollToTop = () => {
        const container = document.getElementById('opensource-container');
        container?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [searchQuery, setSearchQuery] = useState('');

    const filteredOpensource = opensource.filter((item: any) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.title?.toLowerCase().includes(query) ||
            item.repo?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.labels?.some((label: string) => label.toLowerCase().includes(query))
        );
    });

    const getOriginalIndex = (item: any) => opensource.findIndex((o: any) => o.id === item.id || o === item);

    return (
        <div id="opensource-container" className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {/* Top Action Bar */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-4 border-b border-border space-y-4">
                <div className="flex gap-4 flex-wrap">
                    <button onClick={addContribution} className="flex items-center gap-2 px-4 py-2 border border-border text-secondaryText rounded-lg hover:bg-surface hover:text-primaryText transition-colors">
                        <Plus size={18} />
                        Add Contribution
                    </button>
                    <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save All'}
                    </button>
                    {opensource.length > 3 && (
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
                    itemName="Open Source"
                    template={OPENSOURCE_TEMPLATE}
                    onImport={(items) => onChange([...opensource, ...items])}
                />

                {/* Search */}
                {opensource.length > 0 && (
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, repo, description..."
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

            {searchQuery && filteredOpensource.length === 0 && (
                <div className="text-center py-8 text-secondaryText">No contributions match "{searchQuery}"</div>
            )}

            {filteredOpensource.map((item: any) => {
                const index = getOriginalIndex(item);
                return (
                    <CollapsibleItem
                        key={item.id || index}
                        title={item.title || `Contribution ${index + 1}`}
                        subtitle={`${item.repo} • #${item.prNumber}`}
                        isNew={!item.title}
                        onDelete={() => removeContribution(index)}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Title" value={item.title} onChange={(v: string) => updateContribution(index, { title: v })} />
                            <Input label="Repository (owner/repo)" value={item.repo} onChange={(v: string) => updateContribution(index, { repo: v })} placeholder="facebook/react" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="PR Number" value={item.prNumber} onChange={(v: string) => updateContribution(index, { prNumber: parseInt(v) || 0 })} placeholder="123" />
                            <Input label="Date" value={item.date} onChange={(v: string) => updateContribution(index, { date: v })} placeholder="YYYY-MM-DD" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Repo URL" value={item.repoUrl} onChange={(v: string) => updateContribution(index, { repoUrl: v })} placeholder="https://github.com/..." />
                            <Input label="PR URL" value={item.prUrl} onChange={(v: string) => updateContribution(index, { prUrl: v })} placeholder="https://github.com/.../pull/..." />
                        </div>
                        <Input label="Description" value={item.description} onChange={(v: string) => updateContribution(index, { description: v })} multiline />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Labels (comma-separated)"
                                value={Array.isArray(item.labels) ? item.labels.join(', ') : item.labels}
                                onChange={(v: string) => updateContribution(index, { labels: v.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                            />
                            <div>
                                <label className="text-sm text-secondaryText">Status</label>
                                <div className="flex gap-4">
                                    <select
                                        value={item.status}
                                        onChange={(e) => updateContribution(index, { status: e.target.value })}
                                        className="flex-1 mt-1.5 px-3 py-2 bg-background border border-border rounded-lg text-primaryText focus:outline-none focus:border-accent transition-colors"
                                    >
                                        <option value="merged">Merged</option>
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <input
                                            type="checkbox"
                                            id={`pinned-os-${item.id || index}`}
                                            checked={item.pinned || false}
                                            onChange={(e) => updateContribution(index, { pinned: e.target.checked })}
                                            className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent"
                                        />
                                        <label htmlFor={`pinned-os-${item.id || index}`} className="text-sm text-secondaryText select-none cursor-pointer whitespace-nowrap">Pin</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CollapsibleItem>
                );
            })}

            {/* Bottom Scroll Up */}
            {opensource.length > 3 && (
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
