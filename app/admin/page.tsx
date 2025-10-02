import { createClient } from '@supabase/supabase-js';
import { StatsCard } from '@/components/admin/StatsCard';
import { Database, Users, ShoppingBag, FileText, GitMerge, CheckSquare } from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getStats() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const [
    difficultyParams,
    characters,
    items,
    templates,
    mappings,
    questions,
    approvedQuestions
  ] = await Promise.all([
    supabase.from('difficulty_parameters').select('count', { count: 'exact', head: true }),
    supabase.from('characters').select('count', { count: 'exact', head: true }),
    supabase.from('items').select('count', { count: 'exact', head: true }),
    supabase.from('scenario_templates').select('count', { count: 'exact', head: true }),
    supabase.from('curated_mappings').select('count', { count: 'exact', head: true }),
    supabase.from('generated_questions').select('count', { count: 'exact', head: true }),
    supabase.from('generated_questions').select('count', { count: 'exact', head: true }).eq('approved', true),
  ]);

  return {
    difficultyParams: difficultyParams.count || 0,
    characters: characters.count || 0,
    items: items.count || 0,
    templates: templates.count || 0,
    mappings: mappings.count || 0,
    questions: questions.count || 0,
    approvedQuestions: approvedQuestions.count || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to the Factory Architect CMS. Manage your question generation system from here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Difficulty Parameters"
          value={stats.difficultyParams}
          icon={Database}
          href="/admin/difficulty-parameters"
          description="Configuration records"
        />
        <StatsCard
          title="Characters"
          value={stats.characters}
          icon={Users}
          href="/admin/characters"
          description="Available characters"
        />
        <StatsCard
          title="Items"
          value={stats.items}
          icon={ShoppingBag}
          href="/admin/items"
          description="Items with pricing"
        />
        <StatsCard
          title="Scenario Templates"
          value={stats.templates}
          icon={FileText}
          href="/admin/scenario-templates"
          description="Story templates"
        />
        <StatsCard
          title="Curated Mappings"
          value={stats.mappings}
          icon={GitMerge}
          href="/admin/curated-mappings"
          description="Model→Format→Theme"
        />
        <StatsCard
          title="Generated Questions"
          value={stats.questions}
          icon={CheckSquare}
          href="/admin/approval-queue"
          description={`${stats.approvedQuestions} approved`}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/generate"
            className="block rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 transition-colors"
          >
            <div className="text-gray-600">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="mt-2 block text-sm font-semibold">Generate New Questions</span>
            </div>
          </a>

          <a
            href="/admin/curated-mappings"
            className="block rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 transition-colors"
          >
            <div className="text-gray-600">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="mt-2 block text-sm font-semibold">Create New Mapping</span>
            </div>
          </a>

          <a
            href="/admin/approval-queue"
            className="block rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 transition-colors"
          >
            <div className="text-gray-600">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="mt-2 block text-sm font-semibold">Review Questions</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
