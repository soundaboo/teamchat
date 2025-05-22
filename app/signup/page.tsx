import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { MessageSquareIcon } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2 text-2xl font-bold">
        <MessageSquareIcon className="h-8 w-8 text-primary" />
        <span>TeamChat</span>
      </div>
      <AuthForm mode="signup" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}