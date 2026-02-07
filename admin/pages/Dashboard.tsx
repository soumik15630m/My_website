import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getContent, updateContent } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FolderOpen, Award, FileText, LogOut, Save, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

type Tab = 'profile' | 'projects' | 'achievements' | 'notes';

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

    useEffect(() => {
        loadAllContent();
    }, []);

    const loadAllContent = async () => {
        setLoading(true);
        try {
            const [profileRes, projectsRes, achievementsRes, notesRes] = await Promise.all([
                getContent('profile'),
                getContent('projects'),
                getContent('achievements'),
                getContent('notes'),
            ]);
            setProfile(profileRes.data || {});
            setProjects(projectsRes.data || []);
            setAchievements(achievementsRes.data || []);
            setNotes(notesRes.data || []);
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
    ];

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

    return (
        <div className="space-y-6">
            {projects.map((project: any, index: number) => (
                <div key={project.id || index} className="bg-surface border border-border rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-primaryText">Project {index + 1}</h3>
                        <button
                            onClick={() => removeProject(index)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

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
                </div>
            ))}

            <div className="flex gap-4">
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
                    {saving ? 'Saving...' : 'Save All Projects'}
                </button>
            </div>
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

    return (
        <div className="space-y-6">
            {achievements.map((achievement: any, index: number) => (
                <div key={achievement.id || index} className="bg-surface border border-border rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-primaryText">Achievement {index + 1}</h3>
                        <button onClick={() => removeAchievement(index)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <Input label="Title" value={achievement.title} onChange={(v: string) => updateAchievement(index, { title: v })} />
                    <Input label="Context" value={achievement.context} onChange={(v: string) => updateAchievement(index, { context: v })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Year" value={achievement.year} onChange={(v: string) => updateAchievement(index, { year: v })} />
                        <Input label="Verification Link" value={achievement.verificationLink} onChange={(v: string) => updateAchievement(index, { verificationLink: v })} />
                    </div>
                </div>
            ))}

            <div className="flex gap-4">
                <button onClick={addAchievement} className="flex items-center gap-2 px-4 py-2 border border-border text-secondaryText rounded-lg hover:bg-surface hover:text-primaryText transition-colors">
                    <Plus size={18} />
                    Add Achievement
                </button>
                <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save All'}
                </button>
            </div>
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

    return (
        <div className="space-y-6">
            {notes.map((note: any, index: number) => (
                <div key={note.id || index} className="bg-surface border border-border rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-primaryText">Note {index + 1}</h3>
                        <button onClick={() => removeNote(index)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
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
                    <Input label="Image URL (Google Drive)" value={note.imageUrl} onChange={(v: string) => updateNote(index, { imageUrl: v })} placeholder="https://drive.google.com/uc?export=view&id=..." />
                </div>
            ))}

            <div className="flex gap-4">
                <button onClick={addNote} className="flex items-center gap-2 px-4 py-2 border border-border text-secondaryText rounded-lg hover:bg-surface hover:text-primaryText transition-colors">
                    <Plus size={18} />
                    Add Note
                </button>
                <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save All'}
                </button>
            </div>
        </div>
    );
}
