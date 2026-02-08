import { useState, useEffect } from 'react';
import { OpenSourceContribution } from '../types';
import { ParticleMode } from '../components/ParticleField';

const API_BASE = '/api';

// Empty defaults - only used while loading
const EMPTY_PROFILE = {
    name: "",
    handle: "",
    role: "",
    tagline: "",
    location: "",
    availability: "",
    email: "",
    github: "",
    about: "",
    logoText: "",
    logoImage: "",
    loadingSettings: {
        style: 'curtain',
        minLoadTime: 6000,
        revealDuration: 3.5,
        taglineDelay: 1.5,
        taglineStagger: 0.1
    }
};

const NAV_ITEMS = [
    { id: 'home', label: '_home' },
    { id: 'projects', label: '_projects' },
    { id: 'opensource', label: '_opensource' },
    { id: 'achievements', label: '_certificates' },
    { id: 'notes', label: '_writings' },
];

async function fetchContent(type: string) {
    try {
        const res = await fetch(`${API_BASE}/content/${type}`);
        const contentType = res.headers.get("content-type");

        if (!res.ok || !contentType || !contentType.includes("application/json")) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`[Mock] Failed to fetch ${type}: ${res.status} ${contentType}`);
            }
            return null;
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return null;
    }
}

export function useContent() {
    const [profile, setProfile] = useState(EMPTY_PROFILE);
    const [projects, setProjects] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [opensource, setOpensource] = useState<OpenSourceContribution[]>([]);
    const [settings, setSettings] = useState<{ particleMode: ParticleMode }>({ particleMode: 'default' });
    const [navItems] = useState(NAV_ITEMS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadContent() {
            const [profileData, projectsData, achievementsData, notesData, opensourceData, settingsData] = await Promise.all([
                fetchContent('profile'),
                fetchContent('projects'),
                fetchContent('achievements'),
                fetchContent('notes'),
                fetchContent('opensource'),
                fetchContent('settings'),
            ]);

            if (profileData && typeof profileData === 'object') {
                setProfile({
                    ...EMPTY_PROFILE, // Ensure all defaults are present
                    ...profileData,
                    loadingSettings: {
                        ...EMPTY_PROFILE.loadingSettings,
                        ...(profileData.loadingSettings || {})
                    }
                });
            }

            if (Array.isArray(projectsData)) {
                setProjects(projectsData);
            }

            if (Array.isArray(achievementsData)) {
                setAchievements(achievementsData);
            }

            if (Array.isArray(notesData)) {
                setNotes(notesData);
            }

            if (Array.isArray(opensourceData)) {
                setOpensource(opensourceData);
            }

            if (settingsData && typeof settingsData === 'object') {
                setSettings({ particleMode: settingsData.particleMode || 'default' });
            }

            setLoading(false);
        }

        loadContent();
    }, []);

    return { profile, projects, achievements, notes, opensource, settings, navItems, loading };
}
