import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Research Assistant',
  description: 'Autonomous research powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <a href="/" className="text-xl font-bold text-blue-600">
              🔬 AI Research Assistant
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}