import { auth } from './(auth)/auth';
import { redirect } from 'next/navigation';
import AgentGalleryPage from '../components/AgentGalleryPage';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  return <AgentGalleryPage session={session} />;
}