'use client';

import { GeneratedQuestion } from '@/lib/actions/questions';

interface QuestionPreviewProps {
  question: GeneratedQuestion;
}

export function QuestionPreview({ question }: QuestionPreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700">Question</h4>
        <p className="mt-2 rounded-md bg-gray-50 p-4 text-base text-gray-900">
          {question.question_text}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Correct Answer</h4>
          <p className="mt-2 rounded-md bg-green-50 p-3 text-sm font-semibold text-green-900">
            {typeof question.correct_answer === 'object'
              ? JSON.stringify(question.correct_answer)
              : question.correct_answer}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">Distractors</h4>
          <div className="mt-2 space-y-1">
            {(question.distractors || []).map((distractor, idx) => (
              <p key={idx} className="rounded-md bg-red-50 p-2 text-sm text-red-900">
                {typeof distractor === 'object' ? JSON.stringify(distractor) : distractor}
              </p>
            ))}
          </div>
        </div>
      </div>

      {question.reasoning && (
        <div>
          <h4 className="text-sm font-medium text-gray-700">Reasoning</h4>
          <p className="mt-2 rounded-md bg-blue-50 p-3 text-sm text-gray-900">
            {question.reasoning}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Model</h4>
          <p className="mt-1 text-sm text-gray-900">{question.model_id}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700">Difficulty</h4>
          <p className="mt-1 text-sm text-gray-900">{question.difficulty_level}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700">Format</h4>
          <p className="mt-1 text-sm text-gray-900">{question.format}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700">Theme</h4>
          <p className="mt-1 text-sm text-gray-900">{question.theme}</p>
        </div>
      </div>

      {question.metadata && Object.keys(question.metadata).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700">Metadata</h4>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-gray-100 p-3 text-xs">
            {JSON.stringify(question.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
