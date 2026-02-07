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
}

export interface Achievement {
  id: string;
  title: string;
  context: string;
  year: string;
  verificationLink?: string;
}

export interface Note {
  id: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  readTime: string;
  content?: string;
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
}

export type ViewState = 'home' | 'projects' | 'achievements' | 'notes' | 'opensource';

export interface NavItem {
  id: ViewState;
  label: string;
}