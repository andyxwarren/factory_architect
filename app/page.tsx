import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Factory Architect
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Educational Mathematics Question Generator for UK National Curriculum
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Math Engine</h2>
            <p className="text-gray-600 mb-4">
              Pure mathematical models that operate on numbers and logical parameters.
              Each operation is atomic and separate from narrative context.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Addition - Summing arrays of values</li>
              <li>✓ Subtraction - Finding differences</li>
              <li>✓ Multiplication - Computing products</li>
              <li>✓ Division - Quotients and remainders</li>
              <li>✓ Percentage - Calculations and comparisons</li>
              <li>✓ Fraction - Finding fractions of amounts</li>
              <li>✓ Counting - Coin combinations and counting</li>
              <li>✓ Time Rate - Savings over time periods</li>
              <li>✓ Conversion - Unit conversions (£/p, m/cm)</li>
              <li>✓ Comparison - Value and rate comparisons</li>
              <li className="text-gray-400">○ Multi-Step - Operation sequences</li>
              <li className="text-gray-400">○ Linear Equations - y = mx + c</li>
              <li className="text-gray-400">○ Unit Rate - Rate calculations</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Story Engine</h2>
            <p className="text-gray-600 mb-4">
              Contextual layer that wraps mathematical output with real-world scenarios.
              Same math can be presented as money, measurements, or other contexts.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Money contexts - Shopping, change, savings</li>
              <li>✓ Dynamic question templates</li>
              <li>✓ Year-appropriate difficulty scaling</li>
              <li>✓ UK National Curriculum aligned</li>
              <li className="text-gray-400">○ Measurement contexts</li>
              <li className="text-gray-400">○ Time-based scenarios</li>
              <li className="text-gray-400">○ Multi-language support</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Separation of Concerns</h3>
              <p className="text-gray-600 text-sm">
                Mathematical logic completely separated from story context for maximum flexibility.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Difficulty Scaling</h3>
              <p className="text-gray-600 text-sm">
                Questions adapt to Years 1-6 with progressive complexity and appropriate parameters.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Context Flexibility</h3>
              <p className="text-gray-600 text-sm">
                Same mathematical output can be wrapped in different real-world scenarios.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/test"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Question Testing
            </Link>
            <Link
              href="/curriculum-manager"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Curriculum Manager
            </Link>
            <Link
              href="/curriculum-tester"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Testing Center
            </Link>
            <Link
              href="/curriculum-curator"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Curriculum Curator
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold text-lg mb-2">Core Interfaces</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Question Testing:</strong> Generate and test individual questions</li>
                <li><strong>Curriculum Manager:</strong> Bulk generation for all curriculum combinations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Testing & Curation</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Testing Center:</strong> Systematically test model-curriculum combinations</li>
                <li><strong>Curriculum Curator:</strong> Define and manage curated model mappings</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API Usage</h2>
          <p className="text-gray-600 mb-4">
            Generate questions programmatically using our REST API:
          </p>
          <div className="bg-gray-800 text-green-400 p-4 rounded-md text-sm font-mono">
            <p className="mb-2">POST /api/generate</p>
            <p className="text-gray-300">
              {`{
  "model_id": "ADDITION",
  "year_level": 4,
  "context_type": "money"
}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
