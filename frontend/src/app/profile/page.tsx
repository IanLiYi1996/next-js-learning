import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import MainPage from '@/components/main-page';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'View and manage your profile',
};

export default async function ProfilePage() {
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
          <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            View and manage your personal information.
          </p>
        </div>
        <Separator />

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback className="text-lg">
                  {session.user?.name?.charAt(0) || 
                   session.user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle className="text-2xl">{session.user?.name || 'User'}</CardTitle>
                <CardDescription className="text-md">
                  {session.user?.email || 'No email available'}
                </CardDescription>
                <div className="flex mt-2">
                  <Badge variant="outline" className="bg-primary/10">Pro Plan</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-1">
                <h3 className="font-medium text-lg">Account Information</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Account ID</p>
                    <p className="font-medium">{session.user?.id || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member since</p>
                    <p className="font-medium">January 2023</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last login</p>
                    <p className="font-medium">Today</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">Active</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-lg">Activity Summary</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <Card className="border bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                    </CardContent>
                  </Card>
                  <Card className="border bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-2xl font-bold">348</p>
                      <p className="text-sm text-muted-foreground">Comments</p>
                    </CardContent>
                  </Card>
                  <Card className="border bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-2xl font-bold">7</p>
                      <p className="text-sm text-muted-foreground">Projects</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainPage>
  );
}