import { Project, Achievement, Note, NavItem } from './types';

// These are empty defaults - actual data comes from the database via API
export const PROFILE = {
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

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '_home' },
  { id: 'projects', label: '_projects' },
  { id: 'achievements', label: '_achievements' },
  { id: 'notes', label: '_log' },
];

export const PROJECTS: Project[] = [];

export const ACHIEVEMENTS: Achievement[] = [];

export const NOTES: Note[] = [];