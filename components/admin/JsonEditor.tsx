'use client';

import { useState, useEffect } from 'react';

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function JsonEditor({ value, onChange, placeholder, disabled }: JsonEditorProps) {
  const [textValue, setTextValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setTextValue(JSON.stringify(value, null, 2));
      setError(null);
    } catch (e) {
      setTextValue('');
    }
  }, [value]);

  const handleChange = (newText: string) => {
    setTextValue(newText);

    if (!newText.trim()) {
      setError(null);
      onChange({});
      return;
    }

    try {
      const parsed = JSON.parse(newText);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={textValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`block w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm focus:outline-none focus:ring-1 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        }`}
        rows={12}
        spellCheck={false}
      />
      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
