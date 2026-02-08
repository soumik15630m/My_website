export interface Project {
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  technicalDecisions: string[];
  techStack: string[];
  githubUrl?: string;
  status: 'active' | 'archived' | 'completed';
  year: string;
  image?: string;
  architecture?: string; // Mermaid diagram code
  pinned?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  context: string;
  year: string;
  verificationLink?: string;
  image?: string;
}

export interface Note {
  id: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  readTime: string;
  content?: string;
  image?: string;
  images?: string[]; // Multiple images for gallery
}

export interface OpenSourceContribution {
  id: string;
  repo: string;
  repoUrl: string;
  title: string;
  prNumber: number;
  prUrl: string;
  status: 'merged' | 'open' | 'closed';
  labels: string[];
  date: string;
  description?: string;
  image?: string; // Screenshot or diagram
  pinned?: boolean;
}

export type ViewState = 'home' | 'projects' | 'achievements' | 'notes' | 'opensource';

export interface NavItem {
  id: ViewState;
  label: string;
}

export interface Profile {
  name: string;
  handle: string;
  role: string;
  tagline: string;
  location: string;
  availability: string;
  email: string;
  github: string;
  about: string;
}