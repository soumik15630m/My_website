import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getContent, updateContent } from '../api';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, FolderOpen, Award, FileText, LogOut, ChevronLeft, ChevronRight, GitPullRequest, Upload } from 'lucide-react';

import { ProfileEditor } from '../components/ProfileEditor';
import { ProjectsEditor } from '../components/ProjectsEditor';
import { AchievementsEditor } from '../components/AchievementsEditor';
import { NotesEditor } from '../components/NotesEditor';
import { OpenSourceEditor } from '../components/OpenSourceEditor';
import { ImportExportEditor } from '../components/ImportExportEditor';

type Tab = 'profile' | 'projects' | 'achievements' | 'notes' | 'opensource' | 'import';

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
    const [opensource, setOpensource] = useState<any[]>([]);


    useEffect(() => {
        loadAllContent();
    }, []);

    const loadAllContent = async () => {
        setLoading(true);
        try {
            const [profileRes, projectsRes, achievementsRes, notesRes, opensourceRes] = await Promise.all([
                getContent('profile'),
                getContent('projects'),
                getContent('achievements'),
                getContent('notes'),
                getContent('opensource'),
            ]);
            setProfile(profileRes.data || {});
            setProjects(projectsRes.data || []);
            setAchievements(achievementsRes.data || []);
            setNotes(notesRes.data || []);
            setOpensource(opensourceRes.data || []);
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
        { id: 'opensource' as Tab, label: 'Open Source', icon: GitPullRequest },
        { id: 'import' as Tab, label: 'Import / Export', icon: Upload },
    ];

    // JSON Import/Export handlers
    const handleImportJSON = (jsonData: any) => {
        try {
            if (jsonData.profile) setProfile(jsonData.profile);
            if (jsonData.projects) setProjects(jsonData.projects);
            if (jsonData.achievements) setAchievements(jsonData.achievements);
            if (jsonData.notes) setNotes(jsonData.notes);
            if (jsonData.opensource) setOpensource(jsonData.opensource);
            showMessage('success', 'Data imported successfully!');
        } catch {
            showMessage('error', 'Failed to import data');
        }
    };

    const handleExportJSON = () => {
        const data = { profile, projects, achievements, notes, opensource };
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
                                    projects={projects}
                                    onUpdateProjects={(newProjects: any[]) => {
                                        setProjects(newProjects);
                                        saveContent('projects', newProjects);
                                    }}
                                    opensource={opensource}
                                    onUpdateOpensource={(newOpensource: any[]) => {
                                        setOpensource(newOpensource);
                                        saveContent('opensource', newOpensource);
                                    }}
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

                            {activeTab === 'opensource' && (
                                <OpenSourceEditor
                                    opensource={opensource}
                                    onChange={setOpensource}
                                    onSave={() => saveContent('opensource', opensource)}
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
