import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import MainPage from '@/components/main-page';
import { Metadata } from 'next';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Application settings and preferences',
};

export default async function SettingsPage() {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-muted-foreground text-sm">
                    Select a theme for the dashboard
                  </p>
                </div>
                <ThemeToggle />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-muted-foreground text-sm">
                    Select your preferred language
                  </p>
                </div>
                <LocaleSwitcher />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Update your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">
                  {session.user?.email || 'No email available'}
                </p>
              </div>
              <Separator />
              <div>
                <p className="font-medium">Name</p>
                <p className="text-muted-foreground">
                  {session.user?.name || 'No name available'}
                </p>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button variant="outline">Update Profile</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainPage>
  );
}