import React from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';

interface CollapsibleItemProps {
    title: string;
    subtitle?: string;
    isNew?: boolean;
    onDelete: () => void;
    children: React.ReactNode;
}

export function CollapsibleItem({
    title,
    subtitle,
    isNew,
    onDelete,
    children
}: CollapsibleItemProps) {
    const [expanded, setExpanded] = React.useState(isNew || false);

    return (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background/50 transition-colors"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ChevronRight
                        size={18}
                        className={`text-secondaryText transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}
                    />
                    <div className="min-w-0">
                        <h3 className="font-medium text-primaryText truncate">
                            {title || <span className="text-secondaryText/50 italic">Untitled</span>}
                        </h3>
                        {subtitle && !expanded && (
                            <p className="text-xs text-secondaryText truncate">{subtitle}</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            {expanded && (
                <div className="p-4 pt-0 space-y-4 border-t border-border">
                    {children}
                </div>
            )}
        </div>
    );
}
