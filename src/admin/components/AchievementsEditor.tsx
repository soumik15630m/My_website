import React, { useState } from 'react';
import { Plus, Save, ChevronDown, Search, X, ChevronUp } from 'lucide-react';
import { Input } from './ui/Input';
import { CollapsibleItem } from './ui/CollapsibleItem';
import { JsonImportSection } from './JsonImportSection';
import { ACHIEVEMENT_TEMPLATE } from './templates';

interface AchievementsEditorProps {
    achievements: any[];
    onChange: (achievements: any[]) => void;
    onSave: () => void;
    saving: boolean;
}

export const AchievementsEditor: React.FC<AchievementsEditorProps> = ({ achievements, onChange, onSave, saving }) => {
    const addAchievement = () => {
        onChange([
            ...achievements,
            { id: `a${Date.now()}`, title: '', context: '', year: new Date().getFullYear().toString(), verificationLink: '' },
        ]);
    };

    const updateAchievement = (index: number, updates: any) => {
        const newAchievements = [...achievements];
        newAchievements[index] = { ...newAchievements[index], ...updates };
        onChange(newAchievements);
    };

    const removeAchievement = (index: number) => {
        onChange(achievements.filter((_: any, i: number) => i !== index));
    };

    const scrollToBottom = () => {
        const container = document.getElementById('achievements-container');
        container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    };

    const scrollToTop = () => {
        const container = document.getElementById('achievements-container');
        container?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [searchQuery, setSearchQuery] = useState('');

    const filteredAchievements = achievements.filter((a: any) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            a.title?.toLowerCase().includes(query) ||
            a.context?.toLowerCase().includes(query) ||
            a.year?.toString().includes(query)
        );
    });

    const getOriginalIndex = (item: any) => achievements.findIndex((a: any) => a.id === item.id || a === item);

    return (
        <div id="achievements-container" className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {/* Top Action Bar */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-4 border-b border-border space-y-4">
                <div className="flex gap-4 flex-wrap">
                    <button onClick={addAchievement} className="flex items-center gap-2 px-4 py-2 border border-border text-secondaryText rounded-lg hover:bg-surface hover:text-primaryText transition-colors">
                        <Plus size={18} />
                        Add Achievement
                    </button>
                    <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save All'}
                    </button>
                    {achievements.length > 3 && (
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
                    itemName="Achievements"
                    template={ACHIEVEMENT_TEMPLATE}
                    onImport={(items) => onChange([...achievements, ...items])}
                />

                {/* Search */}
                {achievements.length > 0 && (
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, context, or year..."
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

            {searchQuery && filteredAchievements.length === 0 && (
                <div className="text-center py-8 text-secondaryText">No achievements match "{searchQuery}"</div>
            )}

            {filteredAchievements.map((achievement: any) => {
                const index = getOriginalIndex(achievement);
                return (
                    <CollapsibleItem
                        key={achievement.id || index}
                        title={achievement.title || `Achievement ${index + 1}`}
                        subtitle={achievement.context || achievement.year}
                        isNew={!achievement.title}
                        onDelete={() => removeAchievement(index)}
                    >
                        <Input label="Title" value={achievement.title} onChange={(v: string) => updateAchievement(index, { title: v })} />
                        <Input label="Context" value={achievement.context} onChange={(v: string) => updateAchievement(index, { context: v })} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Year" value={achievement.year} onChange={(v: string) => updateAchievement(index, { year: v })} />
                            <Input label="Verification Link" value={achievement.verificationLink} onChange={(v: string) => updateAchievement(index, { verificationLink: v })} />
                        </div>
                    </CollapsibleItem>
                );
            })}

            {/* Bottom Scroll Up */}
            {achievements.length > 3 && (
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
