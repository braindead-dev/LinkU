import Link from "next/link";
import Image from "next/image";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Link href="/" className="flex items-center self-center font-medium">
          <Image
            src="/logo.png"
            alt="Logo"
            width={75}
            height={50}
            className="h-auto"
          />
        </Link>
        <SignupForm />
      </div>
    </div>
  );
}
