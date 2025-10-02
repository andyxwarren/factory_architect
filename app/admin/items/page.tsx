import { getItems } from '@/lib/actions/items';
import { ItemTable } from '@/components/admin/ItemTable';

export const metadata = {
  title: 'Items | Admin',
  description: 'Manage story items',
};

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Items</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage items used in question scenarios with pricing information
          </p>
        </div>
      </div>

      <ItemTable items={items} />
    </div>
  );
}
