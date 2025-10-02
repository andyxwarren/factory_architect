import { getTemplates } from '@/lib/actions/templates';
import { TemplateTable } from '@/components/admin/TemplateTable';

export const metadata = {
  title: 'Scenario Templates | Admin',
  description: 'Manage scenario templates',
};

export default async function ScenarioTemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scenario Templates</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage contextual scenario templates for question generation
          </p>
        </div>
      </div>

      <TemplateTable templates={templates} />
    </div>
  );
}
