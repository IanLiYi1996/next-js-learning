import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import MainPage from '@/components/main-page';
import Dashboard from '@/components/ui/dashboard-with-collapsible-sidebar';

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