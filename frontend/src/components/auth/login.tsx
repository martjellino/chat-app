'use client'

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

interface LoginState {
  error: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;  // Replace 'any' with your User type if available
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;


async function loginAction(_prevState: LoginState | null, formData: FormData): Promise<LoginState> {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password')
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'An error occurred during login'
      }));
      return { error: errorData.message || 'Login failed', user: null };
    }

    const data = await response.json();
    return { error: null, user: data.user };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { error: errorMessage, user: null };
  }
}

export const Login = () => {
  const router = useRouter();
  const { setUser } = useAuth();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  // Handle successful login using useEffect
  useEffect(() => {
    if (state?.user) {
      setUser(state.user);
      router.push('/chat');
    }
  }, [state?.user, setUser, router]);

  // Show error toast if there's an error
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-darkBg">
      <Card className="w-full max-w-md bg-bg dark:bg-darkBg">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            Welcome back!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" action={formAction}>
            {state?.error && (
              <div className="p-3 text-sm bg-red-100 border border-red-400 text-red-700 rounded">
                {state.error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              href="/register"
              className="text-purple-900 hover:underline block"
            >
              Need an account? Register
            </Link>
            {/* <Link
              href="/forgot-password"
              className="text-main hover:underline block"
            >
              Forgot your password?
            </Link> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;