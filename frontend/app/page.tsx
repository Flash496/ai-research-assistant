import { SearchInput } from '@/components/SearchInput';

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              AI Research Assistant
            </h1>
            <p className="text-xl text-gray-600">
              Ask any question. Get comprehensive, sourced research reports in minutes.
            </p>
          </div>

          <SearchInput />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold mb-2">Comprehensive Search</h3>
              <p className="text-gray-600 text-sm">Multi-source research across the web</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">Intelligent Analysis</h3>
              <p className="text-gray-600 text-sm">AI-powered insights and synthesis</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">📄</div>
              <h3 className="font-semibold mb-2">Professional Reports</h3>
              <p className="text-gray-600 text-sm">Well-structured with full citations</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}