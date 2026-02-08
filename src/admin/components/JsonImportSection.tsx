import React, { useState } from 'react';
import { FileUp, Copy, Upload } from 'lucide-react';

interface JsonImportSectionProps {
    itemName: string;
    template: string;
    onImport: (items: any[]) => void;
}

export const JsonImportSection: React.FC<JsonImportSectionProps> = ({ itemName, template, onImport }) => {
    const [expanded, setExpanded] = useState(false);
    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonText);
            const items = Array.isArray(parsed) ? parsed : [parsed];

            // Add unique IDs if missing
            const itemsWithIds = items.map((item: any, index: number) => ({
                ...item,
                id: item.id || `imported_${Date.now()}_${index}`
            }));

            onImport(itemsWithIds);
            setJsonText('');
            setError(null);
            setExpanded(false);
        } catch (e) {
            setError('Invalid JSON format');
        }
    };

    return (
        <div className="border border-dashed border-border rounded-xl p-4 bg-background/50">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm text-secondaryText hover:text-primaryText transition-colors"
            >
                <FileUp size={16} />
                {expanded ? 'Hide' : `Import ${itemName} from JSON`}
            </button>

            {expanded && (
                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-secondaryText">Paste JSON array (will be ADDED to existing {itemName.toLowerCase()})</span>
                        <button
                            onClick={() => {
                                if (jsonText === template) {
                                    setJsonText('');
                                } else {
                                    setJsonText(template);
                                }
                                setError(null);
                            }}
                            className="flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                            <Copy size={12} />
                            {jsonText === template ? 'Hide Template' : 'Show Template'}
                        </button>
                    </div>
                    <textarea
                        value={jsonText}
                        onChange={(e) => { setJsonText(e.target.value); setError(null); }}
                        placeholder={`Paste ${itemName.toLowerCase()} JSON here...`}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-primaryText text-xs font-mono placeholder:text-secondaryText/30 focus:outline-none focus:border-accent transition-colors resize-none"
                        rows={6}
                    />
                    {error && (
                        <div className="text-xs text-red-400">{error}</div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={handleImport}
                            disabled={!jsonText.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-background text-xs rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                        >
                            <Upload size={14} />
                            Add {itemName}
                        </button>
                        <button
                            onClick={() => { setExpanded(false); setJsonText(''); setError(null); }}
                            className="px-3 py-1.5 text-xs text-secondaryText hover:text-primaryText transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="text-xs text-amber-400/70">
                        Note: Imported items will be ADDED to your existing {itemName.toLowerCase()}, not replace them.
                    </div>
                </div>
            )}
        </div>
    );
};
