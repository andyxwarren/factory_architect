import { getDifficultyParams } from '@/lib/actions/difficulty-params';
import { DifficultyParamTable } from '@/components/admin/DifficultyParamTable';

export const metadata = {
  title: 'Difficulty Parameters | Admin',
  description: 'Manage difficulty parameters',
};

export default async function DifficultyParametersPage() {
  const params = await getDifficultyParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Difficulty Parameters</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage difficulty parameters for each mathematical model and year level
          </p>
        </div>
      </div>

      <DifficultyParamTable params={params} />
    </div>
  );
}
