import { getQuestions } from '@/lib/actions/questions';
import { ApprovalQueueTable } from '@/components/admin/ApprovalQueueTable';

export const metadata = {
  title: 'Approval Queue | Admin',
  description: 'Review and approve generated questions',
};

export default async function ApprovalQueuePage() {
  // Fetch only unapproved questions
  const questions = await getQuestions({ approved: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and approve generated questions before they are published
          </p>
        </div>
        <div className="text-sm text-gray-600">
          {questions.length} question{questions.length !== 1 ? 's' : ''} pending approval
        </div>
      </div>

      <ApprovalQueueTable questions={questions} />
    </div>
  );
}
