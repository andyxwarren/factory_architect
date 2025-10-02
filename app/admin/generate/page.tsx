import { GenerateQuestionsForm } from '@/components/admin/GenerateQuestionsForm';

export const metadata = {
  title: 'Generate Questions | Admin',
  description: 'Generate questions using the orchestrator',
};

export default function GenerateQuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Questions</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate questions using the enhanced orchestrator with full control over parameters
          </p>
        </div>
      </div>

      <GenerateQuestionsForm />
    </div>
  );
}
