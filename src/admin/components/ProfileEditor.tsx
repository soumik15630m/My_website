import React from 'react';
import { Save, Award, X, ChevronDown } from 'lucide-react';
import { Input } from './ui/Input';

interface ProfileEditorProps {
    profile: any;
    onChange: (profile: any) => void;
    onSave: () => void;
    saving: boolean;
    projects: any[];
    opensource: any[];
    onUpdateProjects: (projects: any[]) => void;
    onUpdateOpensource: (opensource: any[]) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
    profile,
    onChange,
    onSave,
    saving,
    projects,
    opensource,
    onUpdateProjects,
    onUpdateOpensource
}) => {
    const update = (key: string, value: any) => onChange({ ...profile, [key]: value });

    const toggleProjectPin = (index: number) => {
        const newProjects = [...projects];
        newProjects[index] = { ...newProjects[index], pinned: !newProjects[index].pinned };
        onUpdateProjects(newProjects);
    };

    const toggleOssPin = (index: number) => {
        const newOss = [...opensource];
        newOss[index] = { ...newOss[index], pinned: !newOss[index].pinned };
        onUpdateOpensource(newOss);
    };

    return (
        <div className="space-y-8">
            <div className="max-w-2xl space-y-6">
                <div className="p-4 bg-surface/30 rounded-xl border border-border mb-6">
                    <h3 className="text-sm font-medium text-secondaryText mb-4 uppercase tracking-wider">Branding</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Logo Text" value={profile.logoText} onChange={(v: string) => update('logoText', v)} placeholder="0x1A" />
                        <Input label="Logo Image URL" value={profile.logoImage} onChange={(v: string) => update('logoImage', v)} placeholder="https://..." />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Name" value={profile.name} onChange={(v: string) => update('name', v)} placeholder="Your name" />
                    <Input label="Handle" value={profile.handle} onChange={(v: string) => update('handle', v)} placeholder="@handle" />
                </div>
                <Input label="Role/Title" value={profile.role} onChange={(v: string) => update('role', v)} placeholder="Your role" />
                <Input label="Tagline" value={profile.tagline} onChange={(v: string) => update('tagline', v)} placeholder="Short tagline" />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Location" value={profile.location} onChange={(v: string) => update('location', v)} placeholder="City, Country" />
                    <Input label="Availability" value={profile.availability} onChange={(v: string) => update('availability', v)} placeholder="Open to work" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Email" value={profile.email} onChange={(v: string) => update('email', v)} placeholder="you@example.com" />
                    <Input label="GitHub" value={profile.github} onChange={(v: string) => update('github', v)} placeholder="https://github.com/..." />
                </div>
                <Input label="About" value={profile.about} onChange={(v: string) => update('about', v)} multiline placeholder="Tell about yourself..." />

                <div className="flex justify-end pt-4">
                    <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 font-medium">
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>

            {/* Pinned Content Manager */}
            <div className="pt-8 border-t border-border">
                <h3 className="text-lg font-medium text-primaryText mb-6 flex items-center gap-2">
                    <Award size={20} className="text-accent" />
                    Pinned Content
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Pinned Projects */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-secondaryText uppercase tracking-wider">Pinned Projects</h4>
                            <span className="text-xs text-secondaryText/50">Auto-saves</span>
                        </div>
                        <div className="bg-surface/50 rounded-xl border border-border overflow-hidden">
                            {projects?.filter((p: any) => p.pinned).length === 0 ? (
                                <div className="p-4 text-center text-secondaryText text-sm">No pinned projects</div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {projects?.map((p: any, i: number) => p.pinned && (
                                        <div key={p.id || i} className="flex items-center justify-between p-3 hover:bg-surface transition-colors group">
                                            <span className="text-sm text-primaryText truncate">{p.title}</span>
                                            <button onClick={() => toggleProjectPin(i)} className="text-secondaryText hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <select
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondaryText focus:border-accent focus:outline-none appearance-none cursor-pointer"
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) {
                                        toggleProjectPin(val);
                                        e.target.value = "";
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>+ Pin a project...</option>
                                {projects?.map((p: any, i: number) => !p.pinned && (
                                    <option key={p.id || i} value={i}>{p.title}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText pointer-events-none" />
                        </div>
                    </div>

                    {/* Pinned Open Source */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-secondaryText uppercase tracking-wider">Pinned Open Source</h4>
                            <span className="text-xs text-secondaryText/50">Auto-saves</span>
                        </div>
                        <div className="bg-surface/50 rounded-xl border border-border overflow-hidden">
                            {opensource?.filter((o: any) => o.pinned).length === 0 ? (
                                <div className="p-4 text-center text-secondaryText text-sm">No pinned items</div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {opensource?.map((o: any, i: number) => o.pinned && (
                                        <div key={o.id || i} className="flex items-center justify-between p-3 hover:bg-surface transition-colors group">
                                            <div className="flex flex-col min-w-0 pr-2">
                                                <span className="text-sm text-primaryText truncate">{o.title}</span>
                                                <span className="text-[10px] text-secondaryText truncate">{o.repo}</span>
                                            </div>
                                            <button onClick={() => toggleOssPin(i)} className="text-secondaryText hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <select
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondaryText focus:border-accent focus:outline-none appearance-none cursor-pointer"
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) {
                                        toggleOssPin(val);
                                        e.target.value = "";
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>+ Pin an item...</option>
                                {opensource?.map((o: any, i: number) => !o.pinned && (
                                    <option key={o.id || i} value={i}>{o.title || o.repo}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
