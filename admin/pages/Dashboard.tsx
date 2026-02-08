import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getContent, updateContent } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FolderOpen, Award, FileText, LogOut, Save, Plus, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Upload, Download, Copy, FileUp, Settings, Search, X } from 'lucide-react';

type Tab = 'profile' | 'projects' | 'achievements' | 'notes' | 'settings';

export function Dashboard() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Content state
    const [profile, setProfile] = useState<any>({});
    const [projects, setProjects] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({ particleMode: 'default' });

    useEffect(() => {
        loadAllContent();
    }, []);

    const loadAllContent = async () => {
        setLoading(true);
        try {
            const [profileRes, projectsRes, achievementsRes, notesRes, settingsRes] = await Promise.all([
                getContent('profile'),
                getContent('projects'),
                getContent('achievements'),
                getContent('notes'),
                getContent('settings'),
            ]);
            setProfile(profileRes.data || {});
            setProjects(projectsRes.data || []);
            setAchievements(achievementsRes.data || []);
            setNotes(notesRes.data || []);
            setSettings(settingsRes.data || { particleMode: 'default' });
        } catch (error) {
            showMessage('error', 'Failed to load content');
        }
        setLoading(false);
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const saveContent = async (type: string, data: any) => {
        if (!token) return;
        setSaving(true);
        try {
            const result = await updateContent(type, data, token);
            if (result.success) {
                showMessage('success', 'Saved successfully!');
            } else {
                showMessage('error', result.error || 'Failed to save');
            }
        } catch {
            showMessage('error', 'Failed to save');
        }
        setSaving(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const tabs = [
        { id: 'profile' as Tab, label: 'Profile', icon: Home },
        { id: 'projects' as Tab, label: 'Projects', icon: FolderOpen },
        { id: 'achievements' as Tab, label: 'Achievements', icon: Award },
        { id: 'notes' as Tab, label: 'Notes', icon: FileText },
        { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    ];

    // JSON Import/Export handlers
    const handleImportJSON = (jsonData: any) => {
        try {
            if (jsonData.profile) setProfile(jsonData.profile);
            if (jsonData.projects) setProjects(jsonData.projects);
            if (jsonData.achievements) setAchievements(jsonData.achievements);
            if (jsonData.notes) setNotes(jsonData.notes);
            showMessage('success', 'Data imported successfully!');
        } catch {
            showMessage('error', 'Failed to import data');
        }
    };

    const handleExportJSON = () => {
        const data = { profile, projects, achievements, notes };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showMessage('success', 'Data exported!');
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <motion.div
                animate={{ width: sidebarOpen ? 256 : 64 }}
                className="bg-surface border-r border-border flex flex-col"
            >
                <div className="p-4 border-b border-border flex items-center justify-between">
                    {sidebarOpen && <h1 className="font-semibold text-primaryText">Admin Panel</h1>}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                        {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                <nav className="flex-1 p-2 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === tab.id
                                ? 'bg-accent/10 text-accent'
                                : 'text-secondaryText hover:bg-background hover:text-primaryText'
                                }`}
                        >
                            <tab.icon size={20} />
                            {sidebarOpen && <span>{tab.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    {sidebarOpen && (
                        <div className="text-xs text-secondaryText mb-2 truncate">{user?.email}</div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-semibold text-primaryText capitalize">{activeTab}</h2>
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={`px-4 py-2 rounded-lg text-sm ${message.type === 'success'
                                    ? 'bg-green-500/10 text-green-400'
                                    : 'bg-red-500/10 text-red-400'
                                    }`}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'profile' && (
                                <ProfileEditor
                                    profile={profile}
                                    onChange={setProfile}
                                    onSave={() => saveContent('profile', profile)}
                                    saving={saving}
                                />
                            )}
                            {activeTab === 'projects' && (
                                <ProjectsEditor
                                    projects={projects}
                                    onChange={setProjects}
                                    onSave={() => saveContent('projects', projects)}
                                    saving={saving}
                                />
                            )}
                            {activeTab === 'achievements' && (
                                <AchievementsEditor
                                    achievements={achievements}
                                    onChange={setAchievements}
                                    onSave={() => saveContent('achievements', achievements)}
                                    saving={saving}
                                />
                            )}
                            {activeTab === 'notes' && (
                                <NotesEditor
                                    notes={notes}
                                    onChange={setNotes}
                                    onSave={() => saveContent('notes', notes)}
                                    saving={saving}
                                />
                            )}
                            {activeTab === 'import' && (
                                <ImportExportEditor
                                    onImport={handleImportJSON}
                                    onExport={handleExportJSON}
                                />
                            )}
                            {activeTab === 'settings' && (
                                <SettingsEditor
                                    settings={settings}
                                    onChange={setSettings}
                                    onSave={() => saveContent('settings', settings)}
                                    saving={saving}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Input component
const Input = ({ label, value, onChange, multiline, placeholder }: any) => (
    <div className="space-y-1.5">
        <label className="text-sm text-secondaryText">{label}</label>
        {multiline ? (
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-primaryText placeholder:text-secondaryText/50 focus:outline-none focus:border-accent transition-colors resize-none"
                rows={4}
            />
        ) : (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-primaryText placeholder:text-secondaryText/50 focus:outline-none focus:border-accent transition-colors"
            />
        )}
    </div>
);

// Profile Editor
function ProfileEditor({ profile, onChange, onSave, saving }: any) {
    const update = (key: string, value: any) => onChange({ ...profile, [key]: value });

    return (
        <div className="max-w-2xl space-y-6">
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

            <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Profile'}
            </button>
        </div>
    );
}

// Collapsible Item Component for cleaner UI
function CollapsibleItem({
    title,
    subtitle,
    isNew,
    onDelete,
    children
}: {
    title: string;
    subtitle?: string;
    isNew?: boolean;
    onDelete: () => void;
    children: React.ReactNode;
}) {
    const [expanded, setExpanded] = React.useState(isNew || false);

    return (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background/50 transition-colors"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ChevronRight
                        size={18}
                        className={`text-secondaryText transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}
                    />
                    <div className="min-w-0">
                        <h3 className="font-medium text-primaryText truncate">
                            {title || <span className="text-secondaryText/50 italic">Untitled</span>}
                        </h3>
                        {subtitle && !expanded && (
                            <p className="text-xs text-secondaryText truncate">{subtitle}</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            {expanded && (
                <div className="p-4 pt-0 space-y-4 border-t border-border">
                    {children}
                </div>
            )}
        </div>
    );
}

// Projects Editor
function ProjectsEditor({ projects, onChange, onSave, saving }: any) {
    const addProject = () => {
        onChange([
            ...projects,
            {
                id: `p${Date.now()}`,
                title: '',
                description: '',
                problemStatement: '',
                technicalDecisions: [],
                techStack: [],
                status: 'active',
                year: new Date().getFullYear().toString(),
                githubUrl: '',
                imageUrl: '',
                architecture: '',
            },
        ]);
    };

    const updateProject = (index: number, updates: any) => {
        const newProjects = [...projects];
        newProjects[index] = { ...newProjects[index], ...updates };
        onChange(newProjects);
    };

    const removeProject = (index: number) => {
        onChange(projects.filter((_: any, i: number) => i !== index));
    };

    const scrollToBottom = () => {
        const container = document.getElementById('projects-container');
        container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    };

    const scrollToTop = () => {
        const container = document.getElementById('projects-container');
        container?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredProjects = projects.filter((project: any) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            project.title?.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query) ||
            project.techStack?.some((tech: string) => tech.toLowerCase().includes(query))
        );
    });

    const getOriginalIndex = (project: any) => projects.findIndex((p: any) => p.id === project.id || p === project);

    return (
        <div id="projects-container" className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {/* Top Action Bar */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-4 border-b border-border space-y-4">
                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={addProject}
                        className="flex items-center gap-2 px-4 py-2 border border-border text-secondaryText rounded-lg hover:bg-surface hover:text-primaryText transition-colors"
                    >
                        <Plus size={18} />
                        Add Project
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save All'}
                    </button>
                    {projects.length > 2 && (
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
                    itemName="Projects"
                    template={PROJECT_TEMPLATE}
                    onImport={(items) => onChange([...projects, ...items])}
                />

                {/* Search */}
                {projects.length > 0 && (
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects by title, description, or tech..."
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

            {searchQuery && filteredProjects.length === 0 && (
                <div className="text-center py-8 text-secondaryText">No projects match "{searchQuery}"</div>
            )}

            {filteredProjects.map((project: any) => {
                const index = getOriginalIndex(project);
                return (
                    <CollapsibleItem
                        key={project.id || index}
                        title={project.title || `Project ${index + 1}`}
                        subtitle={project.description || project.techStack?.join(', ')}
                        isNew={!project.title}
                        onDelete={() => removeProject(index)}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Title" value={project.title} onChange={(v: string) => updateProject(index, { title: v })} />
                            <Input label="Year" value={project.year} onChange={(v: string) => updateProject(index, { year: v })} />
                        </div>
                        <Input label="Description" value={project.description} onChange={(v: string) => updateProject(index, { description: v })} multiline />
                        <Input label="Problem Statement" value={project.problemStatement} onChange={(v: string) => updateProject(index, { problemStatement: v })} multiline />
                        <Input
                            label="Tech Stack (comma-separated)"
                            value={Array.isArray(project.techStack) ? project.techStack.join(', ') : project.techStack}
                            onChange={(v: string) => updateProject(index, { techStack: v.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                        />
                        <Input
                            label="Technical Decisions (one per line)"
                            value={Array.isArray(project.technicalDecisions) ? project.technicalDecisions.join('\n') : project.technicalDecisions}
                            onChange={(v: string) => updateProject(index, { technicalDecisions: v.split('\n').filter(Boolean) })}
                            multiline
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="GitHub URL" value={project.githubUrl} onChange={(v: string) => updateProject(index, { githubUrl: v })} />
                            <Input label="Image URL (Google Drive)" value={project.imageUrl} onChange={(v: string) => updateProject(index, { imageUrl: v })} placeholder="https://drive.google.com/uc?export=view&id=..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm text-secondaryText flex items-center gap-2">
                                Architecture Diagram (Mermaid)
                                <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">
                                    Syntax Guide →
                                </a>
                            </label>
                            <textarea
                                value={project.architecture || ''}
                                onChange={(e) => updateProject(index, { architecture: e.target.value })}
                                placeholder={`graph TD\n    A[Client] --> B[API Gateway]\n    B --> C[Service]\n    C --> D[(Database)]`}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-primaryText font-mono text-xs placeholder:text-secondaryText/30 focus:outline-none focus:border-accent transition-colors resize-none"
                                rows={6}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-secondaryText">Status</label>
                            <select
                                value={project.status}
                                onChange={(e) => updateProject(index, { status: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg text-primaryText focus:outline-none focus:border-accent transition-colors"
                            >
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </CollapsibleItem>
                );
            })}

            {/* Bottom Scroll Up */}
            {projects.length > 2 && (
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
}

// Achievements Editor
function AchievementsEditor({ achievements, onChange, onSave, saving }: any) {
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

    const [searchQuery, setSearchQuery] = React.useState('');

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
}

// Notes Editor
function NotesEditor({ notes, onChange, onSave, saving }: any) {
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

    const [searchQuery, setSearchQuery] = React.useState('');

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
}

// JSON Template for reference
const JSON_TEMPLATE = `{
  "profile": {
    "name": "Your Name",
    "title": "Your Title",
    "bio": "About you...",
    "location": "City, Country"
  },
  "projects": [
    {
      "id": "p1",
      "title": "Project Title",
      "description": "Project description",
      "problemStatement": "What problem does it solve?",
      "technicalDecisions": ["Decision 1", "Decision 2"],
      "techStack": ["React", "TypeScript"],
      "status": "active",
      "year": "2024",
      "githubUrl": "https://github.com/...",
      "image": "https://...",
      "architecture": "graph TD\\n    A[Client] --> B[Server]"
    }
  ],
  "achievements": [
    {
      "id": "a1",
      "title": "Achievement Title",
      "issuer": "Organization",
      "year": "2024",
      "description": "Description",
      "image": "https://..."
    }
  ],
  "notes": [
    {
      "id": "n1",
      "title": "Note Title",
      "summary": "Brief summary",
      "content": "Full content here...",
      "date": "2024-01-15",
      "readTime": "5 min",
      "tags": ["tag1", "tag2"],
      "image": "https://featured-image.jpg",
      "images": ["https://gallery1.jpg", "https://gallery2.jpg"]
    }
  ]
}`;

// Import/Export Editor Component
function ImportExportEditor({ onImport, onExport }: { onImport: (data: any) => void; onExport: () => void }) {
    const [jsonText, setJsonText] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [showTemplate, setShowTemplate] = React.useState(true);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleTextChange = (value: string) => {
        setJsonText(value);
        setShowTemplate(false);
        setError(null);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        setShowTemplate(false);
    };

    const handleCopyTemplate = async () => {
        try {
            await navigator.clipboard.writeText(JSON_TEMPLATE);
            setError(null);
        } catch {
            setError('Failed to copy template');
        }
    };

    const handleImport = () => {
        try {
            const data = JSON.parse(jsonText);
            onImport(data);
            setError(null);
        } catch {
            setError('Invalid JSON format. Please check your input.');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                setJsonText(text);
                setShowTemplate(false);
                setError(null);
            } catch {
                setError('Failed to read file');
            }
        };
        reader.readAsText(file);
    };

    const displayText = showTemplate && !jsonText ? JSON_TEMPLATE : jsonText;

    return (
        <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-primaryText">Import Data</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopyTemplate}
                            className="flex items-center gap-2 px-3 py-1.5 border border-border text-secondaryText rounded-lg hover:bg-background hover:text-primaryText transition-colors text-sm"
                        >
                            <Copy size={14} />
                            Copy Template
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 border border-border text-secondaryText rounded-lg hover:bg-background hover:text-primaryText transition-colors text-sm"
                        >
                            <FileUp size={14} />
                            Upload File
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>
                </div>

                <p className="text-sm text-secondaryText">
                    Paste your JSON data below or upload a file. The template shows the expected structure.
                </p>

                <div className="relative">
                    <textarea
                        value={displayText}
                        onChange={(e) => handleTextChange(e.target.value)}
                        onPaste={handlePaste}
                        onFocus={() => {
                            if (showTemplate) {
                                setShowTemplate(false);
                                setJsonText('');
                            }
                        }}
                        placeholder="Paste your JSON here..."
                        className={`w-full h-96 px-4 py-3 bg-background border border-border rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-accent transition-colors ${showTemplate ? 'text-secondaryText/50' : 'text-primaryText'
                            }`}
                        spellCheck={false}
                    />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={handleImport}
                        disabled={!jsonText.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload size={18} />
                        Import Data
                    </button>
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
                    >
                        <Download size={18} />
                        Export Current Data
                    </button>
                </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">
                <strong>Note:</strong> Importing data will replace your current form values. Make sure to save changes to update the database after importing.
            </div>
        </div>
    );
}

// Settings Editor Component
function SettingsEditor({ settings, onChange, onSave, saving }: any) {
    const particleModes = [
        { value: 'default', label: 'Default - Depth Layers + Mesh', description: 'Particles at different depths with connection lines' },
        { value: 'aurora', label: 'Aurora - Gradient Blobs', description: 'Flowing gradient orbs with subtle particles' },
        { value: 'antigravity', label: 'Antigravity - Plus Signs', description: '+ shaped particles that repel from mouse' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-primaryText mb-2">Background Animation</h3>
                    <p className="text-sm text-secondaryText mb-4">Choose the particle animation style for your portfolio background.</p>
                </div>

                <div className="space-y-3">
                    {particleModes.map((mode) => (
                        <label
                            key={mode.value}
                            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${settings.particleMode === mode.value
                                ? 'border-accent bg-accent/10'
                                : 'border-border hover:border-accent/50 hover:bg-surface/50'
                                }`}
                        >
                            <input
                                type="radio"
                                name="particleMode"
                                value={mode.value}
                                checked={settings.particleMode === mode.value}
                                onChange={(e) => onChange({ ...settings, particleMode: e.target.value })}
                                className="mt-1 accent-accent"
                            />
                            <div>
                                <div className="font-medium text-primaryText">{mode.label}</div>
                                <div className="text-sm text-secondaryText">{mode.description}</div>
                            </div>
                        </label>
                    ))}
                </div>

                <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}

// Inline JSON Import Section (per-page, appends data)
function JsonImportSection({ itemName, template, onImport }: {
    itemName: string;
    template: string;
    onImport: (items: any[]) => void;
}) {
    const [expanded, setExpanded] = React.useState(false);
    const [jsonText, setJsonText] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonText);
            const items = Array.isArray(parsed) ? parsed : [parsed];

            // Add unique IDs if missing
            const itemsWithIds = items.map((item: any, index: number) => ({
                ...item,
                id: item.id || `imported_${Date.now()}_${index}`
            }));

            onImport(itemsWithIds);
            setJsonText('');
            setError(null);
            setExpanded(false);
        } catch (e) {
            setError('Invalid JSON format');
        }
    };

    return (
        <div className="border border-dashed border-border rounded-xl p-4 bg-background/50">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm text-secondaryText hover:text-primaryText transition-colors"
            >
                <FileUp size={16} />
                {expanded ? 'Hide' : `Import ${itemName} from JSON`}
            </button>

            {expanded && (
                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-secondaryText">Paste JSON array (will be ADDED to existing {itemName.toLowerCase()})</span>
                        <button
                            onClick={() => {
                                if (jsonText === template) {
                                    setJsonText('');
                                } else {
                                    setJsonText(template);
                                }
                                setError(null);
                            }}
                            className="flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                            <Copy size={12} />
                            {jsonText === template ? 'Hide Template' : 'Show Template'}
                        </button>
                    </div>
                    <textarea
                        value={jsonText}
                        onChange={(e) => { setJsonText(e.target.value); setError(null); }}
                        placeholder={`Paste ${itemName.toLowerCase()} JSON here...`}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-primaryText text-xs font-mono placeholder:text-secondaryText/30 focus:outline-none focus:border-accent transition-colors resize-none"
                        rows={6}
                    />
                    {error && (
                        <div className="text-xs text-red-400">{error}</div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={handleImport}
                            disabled={!jsonText.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-background text-xs rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                        >
                            <Upload size={14} />
                            Add {itemName}
                        </button>
                        <button
                            onClick={() => { setExpanded(false); setJsonText(''); setError(null); }}
                            className="px-3 py-1.5 text-xs text-secondaryText hover:text-primaryText transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="text-xs text-amber-400/70">
                        Note: Imported items will be ADDED to your existing {itemName.toLowerCase()}, not replace them.
                    </div>
                </div>
            )}
        </div>
    );
}

// JSON Templates for each section (complete structure)
const PROJECT_TEMPLATE = `[
  {
    "title": "Project Name",
    "description": "Brief project description",
    "problemStatement": "What problem does this solve?",
    "technicalDecisions": [
      "Decision 1: Why we chose this approach",
      "Decision 2: Trade-offs considered"
    ],
    "techStack": ["React", "TypeScript", "Node.js"],
    "status": "active",
    "year": "2024",
    "githubUrl": "https://github.com/username/repo",
    "imageUrl": "https://drive.google.com/uc?export=view&id=...",
    "architecture": "graph TD\\n    A[Client] --> B[API]\\n    B --> C[(Database)]"
  }
]`;

const ACHIEVEMENT_TEMPLATE = `[
  {
    "title": "Achievement/Certificate Title",
    "context": "Issuing Organization or Context",
    "year": "2024",
    "verificationLink": "https://verify.example.com/cert/123"
  }
]`;

const NOTE_TEMPLATE = `[
  {
    "title": "Note/Article Title",
    "summary": "Brief summary of what this note is about. Can be multiple sentences describing the content.",
    "date": "2024-01-15",
    "readTime": "5 min",
    "tags": ["technology", "tutorial", "guide"],
    "image": "https://example.com/featured-image.jpg",
    "images": [
      "https://example.com/gallery-image-1.jpg",
      "https://example.com/gallery-image-2.jpg"
    ]
  }
]`;
