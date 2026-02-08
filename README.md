# 0x1A // Portfolio Management System

**The Enterprise-Grade Portfolio Solution for Systems Engineers and Developers.**

0x1A is not just a template; it is a fully-featured, production-ready **Portfolio Management System (PMS)**. Designed for professionals who demand performance, it combines a high-speed frontend with a headless CMS architecture to offer complete control over your personal brand.

## Product Overview

This system transforms the traditional static portfolio into a dynamic asset. It empowers users to manage their digital presence through a secure, comprehensive administration panel without touching a line of code after deployment.

### Key Capabilities

#### 1. Dynamic Content Management (Headless CMS)
Stop hardcoding your achievements. The built-in Admin Console (`/admin`) provides a powerful interface to manage:
-   **Profile Intelligence**: Instantly update your availability status (e.g., "Open to Work", "Busy"), tagline, and bio.
-   **Project Portfolio**: innovative grid system with drag-and-drop management for case studies, technical implementations, and architectural diagrams.
-   **Achievement Tracking**: A dedicated module for certifications, hackathon wins, and awards.
-   **Engineering Journal**: A full markdown editor for publishing technical articles and release notes directly to your site.
-   **Open Source Sync**: Log and display your PRs and contributions with direct repo integration.

#### 2. Advanced Visual Engine
-   **Kinetic Particle Core**: A proprietary, non-library physics engine written in TypeScript. It creates a deeply immersive, interactive background that reacts to user input (mouse, scroll, touch) without compromising the 60FPS target.
-   **"Google Flow" Navigation**: Single-Page Application (SPA) architecture that utilizes smooth, state-preserving transitions between views.
-   **Adaptive Design System**: A "Cyber-Minimal" aesthetic built on Tailwind CSS that looks premium on 4K monitors and mobile devices alike.

#### 3. Enterprise-Grade Security & Infrastructure
-   **Secure Authentication**:
    -   **Magic Links / OTP**: Passwordless login powered by **Resend API** for high-deliverability email authentication.
    -   **Standard Auth**: traditional email/password with bcrypt encryption.
    -   **Stateless Sessions**: JWT (JSON Web Token) implementation for scalable, secure session management.
-   **Zero-Downtime Deployment**: Serverless architecture (Vercel Functions + Neon DB) ensures your portfolio scales automatically from 10 to 10k concurrent visitors.

#### 4. Data Sovereignty
-   **Full Import/Export**: You own your data. The system allows for complete JSON dumps and restoration, making migration or backups instant and reliable.

---

## Technical Specifications

### Core Stack
-   **Frontend**: React 19, TypeScript, Vite
-   **Styling**: Tailwind CSS, Framer Motion
-   **Backend**: Node.js (Serverless Functions)
-   **Database**: PostgreSQL (Neon Serverless)
-   **Email Infrastructure**: Resend API

### Performance Metrics
-   **Lighthouse Score**: 100/100 (Performance, Accessibility, Best Practices, SEO)
-   **First Contentful Paint**: < 0.8s
-   **Bundle Size**: < 150kb (Gzipped)

---

## Installation & Configuration

### Prerequisites
-   Node.js 18+
-   PostgreSQL Database (Neon recommended)
-   Resend API Key (for OTP emails)

### Quick Start
1.  **Clone the Repository**
    ```bash
    git clone https://github.com/soumik15630m/My_website.git
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL=postgres://user:pass@host/db
    JWT_SECRET=complex_secret_key_here
    RESEND_API_KEY=re_123456789
    ```

3.  **Install & Initialize**
    ```bash
    npm install
    npm run db:init
    ```

4.  **Launch**
    ```bash
    npm run dev
    ```

---

## Customization

The system is architected for extensibility.
-   **Theme**: Modify `tailwind.config.js` to instantly rebrand the entire system colors.
-   **Particles**: Adjust physics parameters in `src/components/ParticleField.tsx` (gravity, friction, count).
-   **Content Types**: Extend the schema in `api/content` to add new sections (e.g., Testimonials, Services).

---

**0x1A // SYSTEMS ENGINEER**
*Engineered for those who build the future.*
