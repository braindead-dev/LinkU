import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MessagesView from "@/components/MessagesView";

export default async function MessagesPage() {
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

  return (
    <div className="flex md:pl-4 lg:pl-8 xl:pl-20">
      <Sidebar profile={profile} />
      <MessagesView currentUser={user} />
    </div>
  );
}
