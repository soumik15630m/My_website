import React from 'react';

interface InputProps {
    label: string;
    value: any;
    onChange: (value: string) => void;
    multiline?: boolean;
    placeholder?: string;
}

export const Input: React.FC<InputProps> = ({ label, value, onChange, multiline, placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-sm text-secondaryText">{label}</label>
        {multiline ? (
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-primaryText placeholder:text-secondaryText/50 focus:outline-none focus:border-accent transition-colors resize-none"
                rows={4}
            />
        ) : (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-primaryText placeholder:text-secondaryText/50 focus:outline-none focus:border-accent transition-colors"
            />
        )}
    </div>
);
