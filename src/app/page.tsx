import { auth } from './(auth)/auth';
import { redirect } from 'next/navigation';
import MainPage from '../components/main-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '首页 | Next.js Learning',
};

export default async function HomePage() {
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

  return <MainPage session={session} />;
}