import { PayBlock } from "@/components/Pay";
import { SignIn } from "@/components/SignIn";
import { Game } from "@/components/Game";
import { VerifyBlock } from "@/components/Verify";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  if (session) {
    return (
      <Game />
    );
  } else {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
      <SignIn />
      </main>
    );
  }
}
