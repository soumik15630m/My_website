import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with dark theme
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
        primaryColor: '#22c55e',
        primaryTextColor: '#E8EAED',
        primaryBorderColor: '#3C4043',
        lineColor: '#8AB4F8',
        secondaryColor: '#1A1A1A',
        tertiaryColor: '#292A2D',
        background: 'transparent',
        mainBkg: '#1A1A1A',
        nodeBorder: '#3C4043',
        clusterBkg: '#1A1A1A',
        clusterBorder: '#3C4043',
        titleColor: '#E8EAED',
        edgeLabelBackground: '#1A1A1A',
        nodeTextColor: '#E8EAED',
    },
    flowchart: {
        curve: 'basis',
        padding: 15,
        htmlLabels: true,
        useMaxWidth: true,
    },
    fontFamily: 'ui-monospace, monospace',
});

interface MermaidDiagramProps {
    chart: string;
    className?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const renderDiagram = useCallback(async () => {
        if (!chart) {
            setError('No diagram data');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Generate unique ID for this diagram
            const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Clean up any previous diagram with similar ids
            const existingDiagram = document.getElementById(id);
            if (existingDiagram) {
                existingDiagram.remove();
            }

            // Render the diagram
            const { svg } = await mermaid.render(id, chart.trim());
            setSvgContent(svg);
            setIsLoading(false);
        } catch (err: any) {
            console.error('Mermaid rendering error:', err);
            setError(err?.message || 'Failed to render diagram');
            setIsLoading(false);
        }
    }, [chart]);

    useEffect(() => {
        // Small delay to ensure component is mounted
        const timer = setTimeout(() => {
            renderDiagram();
        }, 100);

        return () => clearTimeout(timer);
    }, [renderDiagram]);

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center p-4 rounded-lg bg-red-500/10 border border-red-500/20 ${className}`}>
                <p className="text-xs text-red-400 font-mono mb-2">Diagram Error</p>
                <p className="text-[10px] text-red-400/60 font-mono text-center">{error}</p>
            </div>
        );
    }

    if (isLoading || !svgContent) {
        return (
            <div className={`flex items-center justify-center p-4 ${className}`}>
                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`mermaid-diagram flex items-center justify-center ${className}`}
            style={{
                minHeight: '200px',
                overflow: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};
