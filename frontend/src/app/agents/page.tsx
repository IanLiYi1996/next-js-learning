import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import AgentGalleryPage from '@/components/AgentGalleryPage';
import MainPage from '@/components/main-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 助手',
  description: '智能助手和代理',
};

export default async function AgentsPage() {
  let session;
  
  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error:', error);
    // If JWT decryption fails, redirect to signin to clear old tokens
    redirect('/api/auth/signin');
  }

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <MainPage session={session}>
      <AgentGalleryPage session={session} />
    </MainPage>
  );
}