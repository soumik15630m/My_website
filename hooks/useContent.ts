import { useState, useEffect } from 'react';
import { PROFILE, PROJECTS, ACHIEVEMENTS, NOTES, NAV_ITEMS } from '../constants';

const API_BASE = '/api';

async function fetchContent(type: string) {
    try {
        const res = await fetch(`${API_BASE}/content/${type}`);
        if (!res.ok) {
            console.warn(`Failed to fetch ${type}: ${res.status}`);
            return null;
        }
        const json = await res.json();
        console.log(`Fetched ${type}:`, json);
        return json.data;
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
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
            console.log('Loading content from API...');

            const [profileData, projectsData, achievementsData, notesData] = await Promise.all([
                fetchContent('profile'),
                fetchContent('projects'),
                fetchContent('achievements'),
                fetchContent('notes'),
            ]);

            // Update profile if we got valid data
            if (profileData && typeof profileData === 'object') {
                console.log('Setting profile:', profileData);
                setProfile(prev => ({ ...prev, ...profileData }));
            }

            // Update arrays if they have items
            if (Array.isArray(projectsData) && projectsData.length > 0) {
                console.log('Setting projects:', projectsData);
                setProjects(projectsData);
            }

            if (Array.isArray(achievementsData) && achievementsData.length > 0) {
                console.log('Setting achievements:', achievementsData);
                setAchievements(achievementsData);
            }

            if (Array.isArray(notesData) && notesData.length > 0) {
                console.log('Setting notes:', notesData);
                setNotes(notesData);
            }

            setLoading(false);
            console.log('Content loading complete');
        }

        loadContent();
    }, []);

    return { profile, projects, achievements, notes, navItems, loading };
}
