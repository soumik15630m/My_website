import { useState, useEffect } from 'react';
import { OpenSourceContribution } from '../types';

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
    about: ""
};

const NAV_ITEMS = [
    { id: 'home', label: '_home' },
    { id: 'projects', label: '_projects' },
    { id: 'opensource', label: '_opensource' },
    { id: 'achievements', label: '_achievements' },
    { id: 'notes', label: '_writings' },
];

async function fetchContent(type: string) {
    try {
        const res = await fetch(`${API_BASE}/content/${type}`);
        if (!res.ok) {
            console.warn(`Failed to fetch ${type}: ${res.status}`);
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
    const [navItems] = useState(NAV_ITEMS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadContent() {
            const [profileData, projectsData, achievementsData, notesData, opensourceData] = await Promise.all([
                fetchContent('profile'),
                fetchContent('projects'),
                fetchContent('achievements'),
                fetchContent('notes'),
                fetchContent('opensource'),
            ]);

            if (profileData && typeof profileData === 'object') {
                setProfile(profileData);
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

            setLoading(false);
        }

        loadContent();
    }, []);

    return { profile, projects, achievements, notes, opensource, navItems, loading };
}
