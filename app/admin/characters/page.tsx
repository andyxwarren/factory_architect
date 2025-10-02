import { getCharacters } from '@/lib/actions/characters';
import { CharacterTable } from '@/components/admin/CharacterTable';

export const metadata = {
  title: 'Characters | Admin',
  description: 'Manage story characters',
};

export default async function CharactersPage() {
  const characters = await getCharacters();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Characters</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage story characters used in question generation
          </p>
        </div>
      </div>

      <CharacterTable characters={characters} />
    </div>
  );
}
