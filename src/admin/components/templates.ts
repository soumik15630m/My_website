export const PROJECT_TEMPLATE = `[
  {
    "title": "Project Name",
    "description": "Brief project description",
    "problemStatement": "What problem does this solve?",
    "technicalDecisions": [
      "Decision 1: Why we chose this approach",
      "Decision 2: Trade-offs considered"
    ],
    "techStack": ["React", "TypeScript", "Node.js"],
    "status": "active",
    "year": "2024",
    "githubUrl": "https://github.com/username/repo",
    "imageUrl": "https://drive.google.com/uc?export=view&id=...",
    "architecture": "graph TD\\n    A[Client] --> B[API]\\n    B --> C[(Database)]"
  }
]`;

export const ACHIEVEMENT_TEMPLATE = `[
  {
    "title": "Achievement/Certificate Title",
    "context": "Issuing Organization or Context",
    "year": "2024",
    "verificationLink": "https://verify.example.com/cert/123"
  }
]`;

export const NOTE_TEMPLATE = `[
  {
    "title": "Note/Article Title",
    "summary": "Brief summary of what this note is about. Can be multiple sentences describing the content.",
    "date": "2024-01-15",
    "readTime": "5 min",
    "tags": ["technology", "tutorial", "guide"],
    "image": "https://example.com/featured-image.jpg",
    "images": [
      "https://example.com/gallery-image-1.jpg",
      "https://example.com/gallery-image-2.jpg"
    ]
  }
]`;

export const OPENSOURCE_TEMPLATE = `[
    {
        "id": "os1",
        "repo": "facebook/react",
        "repoUrl": "https://github.com/facebook/react",
        "title": "Fix memory leak in useEffect",
        "prNumber": 12345,
        "prUrl": "https://github.com/facebook/react/pull/12345",
        "status": "merged",
        "labels": ["bug", "core"],
        "date": "2024-03-15",
        "description": "Fixed a critical memory leak..."
    }
]`;

export const JSON_TEMPLATE = `{
  "profile": {
    "name": "Your Name",
    "title": "Your Title",
    "bio": "About you...",
    "location": "City, Country"
  },
  "projects": [
    {
      "id": "p1",
      "title": "Project Title",
      "description": "Project description",
      "problemStatement": "What problem does this solve?",
      "technicalDecisions": ["Decision 1", "Decision 2"],
      "techStack": ["React", "TypeScript"],
      "status": "active",
      "year": "2024",
      "githubUrl": "https://github.com/...",
      "image": "https://...",
      "architecture": "graph TD\\n    A[Client] --> B[Server]"
    }
  ],
  "achievements": [
    {
      "id": "a1",
      "title": "Achievement Title",
      "issuer": "Organization",
      "year": "2024",
      "description": "Description",
      "image": "https://..."
    }
  ],
  "notes": [
    {
      "id": "n1",
      "title": "Note Title",
      "summary": "Brief summary",
      "content": "Full content here...",
      "date": "2024-01-15",
      "readTime": "5 min",
      "tags": ["tag1", "tag2"],
      "image": "https://featured-image.jpg",
      "images": ["https://gallery1.jpg", "https://gallery2.jpg"]
    }
  ]
}`;
