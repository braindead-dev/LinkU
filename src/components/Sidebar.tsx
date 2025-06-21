'use client';

import Image from "next/image";
import { FC } from "react";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SidebarProps {
  profile: Profile | null;
}

/**
 * Sidebar – renders the left column with profile information.
 * Only visible on medium screens and up.
 */
const Sidebar: FC<SidebarProps> = ({ profile }) => {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <aside className="hidden md:flex md:flex-col gap-6 w-60 p-4 border-r border-gray-200 dark:border-neutral-800 sticky top-0 h-screen">
      <ProfileSection profile={profile} />
      {/* Future navigation items can be added below */}
      <nav className="flex flex-col gap-4 text-lg font-medium">
        <SidebarLink label="Home" />
        <SidebarLink label="Messages" />
      </nav>
      
      <div className="mt-auto mb-4">
        <button
          onClick={handleSignOut}
          className="w-full text-left text-red-600 hover:text-red-700 font-medium"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

// Helpers
const ProfileSection: FC<{ profile: Profile | null }> = ({ profile }) => (
  <div className="flex items-center gap-3">
    {/* Avatar */}
    {profile?.avatar_url ? (
      <Image
        src={profile.avatar_url}
        alt="Profile"
        width={40}
        height={40}
        className="rounded-full"
      />
    ) : (
      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
    )}
    <div className="flex flex-col">
      <span className="font-semibold leading-none">
        {profile?.full_name || profile?.username || 'User'}
      </span>
      <span className="text-sm text-gray-500 leading-none">
        @{profile?.username || 'username'}
      </span>
    </div>
  </div>
);

interface SidebarLinkProps {
  label: string;
}

const SidebarLink: FC<SidebarLinkProps> = ({ label }) => (
  <a href="#" className="hover:underline">
    {label}
  </a>
); 