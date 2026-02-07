import { useState, useEffect } from 'react';
import { PROFILE, PROJECTS, ACHIEVEMENTS, NOTES, NAV_ITEMS } from '../constants';

const API_BASE = '/api';

async function fetchContent(type: string) {
    try {
        const res = await fetch(`${API_BASE}/content/${type}`);
        const data = await res.json();
        return data.data;
    } catch {
        return null;
    }
}

export function useContent() {
    const [profile, setProfile] = useState(PROFILE);
    const [projects, setProjects] = useState(PROJECTS);
    const [achievements, setAchievements] = useState(ACHIEVEMENTS);
    const [notes, setNotes] = useState(NOTES);
    const [navItems] = useState(NAV_ITEMS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadContent() {
            const [profileData, projectsData, achievementsData, notesData] = await Promise.all([
                fetchContent('profile'),
                fetchContent('projects'),
                fetchContent('achievements'),
                fetchContent('notes'),
            ]);

            if (profileData) setProfile(profileData);
            if (projectsData && projectsData.length > 0) setProjects(projectsData);
            if (achievementsData && achievementsData.length > 0) setAchievements(achievementsData);
            if (notesData && notesData.length > 0) setNotes(notesData);

            setLoading(false);
        }

        loadContent();
    }, []);

    return { profile, projects, achievements, notes, navItems, loading };
}
