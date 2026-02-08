import React, { useState } from 'react';
import { Plus, Save, ChevronDown, Search, X, ChevronUp } from 'lucide-react';
import { Input } from './ui/Input';
import { CollapsibleItem } from './ui/CollapsibleItem';
import { JsonImportSection } from './JsonImportSection';
import { PROJECT_TEMPLATE } from './templates';

interface ProjectsEditorProps {
    projects: any[];
    onChange: (projects: any[]) => void;
    onSave: () => void;
    saving: boolean;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({ projects, onChange, onSave, saving }) => {
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

    const [searchQuery, setSearchQuery] = useState('');

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
                            <div className="space-y-1.5">
                                <label className="text-sm text-secondaryText">Year</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={project.year || ''}
                                        onChange={(e) => updateProject(index, { year: e.target.value })}
                                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-primaryText focus:outline-none focus:border-accent transition-colors"
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`pinned-${project.id || index}`}
                                            checked={project.pinned || false}
                                            onChange={(e) => updateProject(index, { pinned: e.target.checked })}
                                            className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent"
                                        />
                                        <label htmlFor={`pinned-${project.id || index}`} className="text-sm text-secondaryText select-none cursor-pointer">Pin to Home</label>
                                    </div>
                                </div>
                            </div>
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
};
