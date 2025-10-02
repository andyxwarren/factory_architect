'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { Character, createCharacter, updateCharacter, CreateCharacterInput } from '@/lib/actions/characters';

interface CharacterDialogProps {
  open: boolean;
  onClose: () => void;
  character?: Character | null;
}

export function CharacterDialog({ open, onClose, character }: CharacterDialogProps) {
  const [formData, setFormData] = useState<CreateCharacterInput>({
    name: '',
    gender: 'neutral',
    cultural_context: 'UK',
    active: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        gender: character.gender,
        cultural_context: character.cultural_context,
        active: character.active,
      });
    } else {
      setFormData({
        name: '',
        gender: 'neutral',
        cultural_context: 'UK',
        active: true,
      });
    }
    setError(null);
  }, [character, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      if (character) {
        await updateCharacter({ ...formData, id: character.id });
      } else {
        await createCharacter(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save character');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={character ? 'Edit Character' : 'Add Character'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Alex, Emma, Jack"
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender <span className="text-red-600">*</span>
          </label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'neutral' | 'male' | 'female' })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSaving}
          >
            <option value="neutral">Neutral</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label htmlFor="cultural_context" className="block text-sm font-medium text-gray-700">
            Cultural Context
          </label>
          <input
            type="text"
            id="cultural_context"
            value={formData.cultural_context}
            onChange={(e) => setFormData({ ...formData, cultural_context: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., UK, US, India"
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isSaving}
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
            Active (available for question generation)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : character ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
