import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { DashboardProvider } from '@/lib/context';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenClaw Dashboard',
  description: 'Linear-style OpenClaw Management Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0e27] text-gray-100">
        <DashboardProvider>
          <div className="flex h-screen bg-[#0a0e27]">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-[#0a0e27]">
              {children}
            </main>
          </div>
        </DashboardProvider>
      </body>
    </html>
  );
}
