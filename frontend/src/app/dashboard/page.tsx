import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import MainPage from '@/components/main-page';
import Dashboard from '@/components/ui/dashboard-with-collapsible-sidebar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '仪表盘',
  description: '系统仪表盘和数据分析',
};

export default async function DashboardPage() {
  let session;
  
  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error:', error);
    redirect('/api/auth/signin');
  }

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <MainPage session={session}>
      <Dashboard />
    </MainPage>
  );
}