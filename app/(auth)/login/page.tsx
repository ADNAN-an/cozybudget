import { LoginFormWrapper } from "./login-form-wrapper";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md rounded-2xl border-border shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your personal budget tracker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginFormWrapper />
        </CardContent>
      </Card>
    </div>
  );
}
