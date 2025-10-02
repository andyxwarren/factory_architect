'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, UserCircle, X, Search } from 'lucide-react';
import { Character, deleteCharacter, toggleCharacterActive } from '@/lib/actions/characters';
import { CharacterDialog } from './CharacterDialog';
import { DeleteConfirm } from './DeleteConfirm';
import { EmptyState } from './EmptyState';

interface CharacterTableProps {
  characters: Character[];
}

export function CharacterTable({ characters }: CharacterTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (character: Character) => {
    setSelectedCharacter(character);
    setDialogOpen(true);
  };

  const handleDelete = (character: Character) => {
    setSelectedCharacter(character);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCharacter) return;

    setIsDeleting(true);
    try {
      await deleteCharacter(selectedCharacter.id);
      setDeleteDialogOpen(false);
      setSelectedCharacter(null);
    } catch (error) {
      console.error('Failed to delete character:', error);
      alert('Failed to delete character. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (character: Character) => {
    try {
      await toggleCharacterActive(character.id, !character.active);
    } catch (error) {
      console.error('Failed to toggle character:', error);
      alert('Failed to update character status. Please try again.');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCharacter(null);
  };

  const filteredCharacters = characters.filter((character) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      character.name.toLowerCase().includes(query) ||
      character.gender.toLowerCase().includes(query) ||
      character.cultural_context.toLowerCase().includes(query)
    );
  });

  if (characters.length === 0) {
    return (
      <EmptyState
        icon={UserCircle}
        title="No characters yet"
        description="Get started by creating your first character"
        action={{
          label: 'Add Character',
          onClick: () => setDialogOpen(true),
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search characters..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-10 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4" />
            Add Character
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cultural Context
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCharacters.map((character) => (
                <tr key={character.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {character.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    <span className="capitalize">{character.gender}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {character.cultural_context}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggleActive(character)}
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        character.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {character.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(character)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(character)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CharacterDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        character={selectedCharacter}
      />

      <DeleteConfirm
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCharacter(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Character"
        message={`Are you sure you want to delete "${selectedCharacter?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </>
  );
}
