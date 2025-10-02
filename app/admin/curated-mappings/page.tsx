import { getMappings } from '@/lib/actions/mappings';
import { MappingTable } from '@/components/admin/MappingTable';

export const metadata = {
  title: 'Curated Mappings | Admin',
  description: 'Manage curated mappings',
};

export default async function CuratedMappingsPage() {
  const mappings = await getMappings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Curated Mappings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage relationships between models, difficulty parameters, formats, and themes
          </p>
        </div>
      </div>

      <MappingTable mappings={mappings} />
    </div>
  );
}
