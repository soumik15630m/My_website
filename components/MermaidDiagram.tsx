import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with dark theme
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#8AB4F8',
        primaryTextColor: '#E8EAED',
        primaryBorderColor: '#3C4043',
        lineColor: '#5F6368',
        secondaryColor: '#202124',
        tertiaryColor: '#292A2D',
        background: '#0D0D0D',
        mainBkg: '#1A1A1A',
        nodeBorder: '#3C4043',
        clusterBkg: '#1A1A1A',
        clusterBorder: '#3C4043',
        titleColor: '#E8EAED',
        edgeLabelBackground: '#1A1A1A',
    },
    flowchart: {
        curve: 'basis',
        padding: 20,
    },
    fontFamily: 'JetBrains Mono, monospace',
});

interface MermaidDiagramProps {
    chart: string;
    className?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderDiagram = async () => {
            if (!chart || !containerRef.current) return;

            try {
                // Generate unique ID for this diagram
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

                // Render the diagram
                const { svg } = await mermaid.render(id, chart);
                setSvg(svg);
                setError(null);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError('Failed to render diagram');
            }
        };

        renderDiagram();
    }, [chart]);

    if (error) {
        return (
            <div className={`flex items-center justify-center p-4 rounded-lg bg-red-500/10 border border-red-500/20 ${className}`}>
                <p className="text-xs text-red-400 font-mono">{error}</p>
            </div>
        );
    }

    if (!svg) {
        return (
            <div className={`flex items-center justify-center p-4 ${className}`}>
                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`mermaid-diagram overflow-auto ${className}`}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};
