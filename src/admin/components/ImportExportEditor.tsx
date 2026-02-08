import React, { useState, useRef } from 'react';
import { FileUp, Copy, Upload, Download } from 'lucide-react';
import { JSON_TEMPLATE } from './templates';

interface ImportExportEditorProps {
    onImport: (data: any) => void;
    onExport: () => void;
}

export const ImportExportEditor: React.FC<ImportExportEditorProps> = ({ onImport, onExport }) => {
    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showTemplate, setShowTemplate] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTextChange = (value: string) => {
        setJsonText(value);
        setShowTemplate(false);
        setError(null);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        setShowTemplate(false);
    };

    const handleCopyTemplate = async () => {
        try {
            await navigator.clipboard.writeText(JSON_TEMPLATE);
            setError(null);
        } catch {
            setError('Failed to copy template');
        }
    };

    const handleImport = () => {
        try {
            const data = JSON.parse(jsonText);
            onImport(data);
            setError(null);
        } catch {
            setError('Invalid JSON format. Please check your input.');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                setJsonText(text);
                setShowTemplate(false);
                setError(null);
            } catch {
                setError('Failed to read file');
            }
        };
        reader.readAsText(file);
    };

    const displayText = showTemplate && !jsonText ? JSON_TEMPLATE : jsonText;

    return (
        <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-primaryText">Import Data</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopyTemplate}
                            className="flex items-center gap-2 px-3 py-1.5 border border-border text-secondaryText rounded-lg hover:bg-background hover:text-primaryText transition-colors text-sm"
                        >
                            <Copy size={14} />
                            Copy Template
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 border border-border text-secondaryText rounded-lg hover:bg-background hover:text-primaryText transition-colors text-sm"
                        >
                            <FileUp size={14} />
                            Upload File
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>
                </div>

                <p className="text-sm text-secondaryText">
                    Paste your JSON data below or upload a file. The template shows the expected structure.
                </p>

                <div className="relative">
                    <textarea
                        value={displayText}
                        onChange={(e) => handleTextChange(e.target.value)}
                        onPaste={handlePaste}
                        onFocus={() => {
                            if (showTemplate) {
                                setShowTemplate(false);
                                setJsonText('');
                            }
                        }}
                        placeholder="Paste your JSON here..."
                        className={`w-full h-96 px-4 py-3 bg-background border border-border rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-accent transition-colors ${showTemplate ? 'text-secondaryText/50' : 'text-primaryText'
                            }`}
                        spellCheck={false}
                    />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={handleImport}
                        disabled={!jsonText.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload size={18} />
                        Import Data
                    </button>
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
                    >
                        <Download size={18} />
                        Export Current Data
                    </button>
                </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">
                <strong>Note:</strong> Importing data will replace your current form values. Make sure to save changes to update the database after importing.
            </div>
        </div>
    );
};
