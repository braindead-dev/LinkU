import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EditProfileForm from "@/components/EditProfileForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/");
  }

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 bg-white/80 px-4 py-2 backdrop-blur-md dark:border-neutral-800 dark:bg-black/80">
        <Link
          href={`/${profile.username}`}
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h2 className="text-lg font-bold">Edit profile</h2>
      </header>

      <div className="mx-auto max-w-2xl p-4">
        <EditProfileForm profile={profile} />
      </div>
    </div>
  );
}
