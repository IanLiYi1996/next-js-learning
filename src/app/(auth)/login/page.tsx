import { signIn } from '@/app/(auth)/auth';
import { ASSET_TITLE } from '@/lib/constants';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LockIcon, LogoOpenAI } from '@/components/icons';
import { BackgroundPaths } from '@/components/ui/background-paths';

export default function Page() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background Paths Component */}
      <div className="absolute inset-0 z-0">
        <BackgroundPaths title={ASSET_TITLE} />
      </div>
      
      {/* Login Card (positioned on top with z-index) */}
      <div className="relative z-10 flex h-dvh w-full items-center justify-center">
        <Card className="w-full max-w-md overflow-hidden shadow-lg border-border/30 backdrop-blur-sm bg-background/95">
          <CardHeader className="space-y-1 flex flex-col items-center pb-6 pt-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LockIcon size={24} />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {ASSET_TITLE}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center px-6 pb-6">
            <form
              action={async () => {
                'use server';
                await signIn('cognito', { redirectTo: '/' });
              }}
              className="w-full"
            >
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2 transition-all hover:shadow-md"
                size="lg"
              >
                <LogoOpenAI size={18} />
                <span>Sign in with Cognito</span>
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t bg-muted/20 py-4 text-xs text-muted-foreground">
            Secure authentication powered by AWS Cognito
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
