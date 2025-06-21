"use client";

import { FC } from "react";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

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
    router.push("/auth");
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-60 gap-6 border-r border-gray-200 p-4 md:flex md:flex-col dark:border-neutral-800">
      <ProfileSection profile={profile} onSignOut={handleSignOut} />
      {/* Future navigation items can be added below */}
      <nav className="flex flex-col gap-4 text-lg font-medium">
        <SidebarLink label="Home" href="/" />
        <SidebarLink label="Messages" />
      </nav>
    </aside>
  );
};

export default Sidebar;

// Helpers
const ProfileSection: FC<{
  profile: Profile | null;
  onSignOut: () => void;
}> = ({ profile, onSignOut }) => {
  if (!profile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} alt="Profile" />
            <AvatarFallback>
              {profile.full_name?.charAt(0).toUpperCase() ||
                profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className="block truncate leading-none font-semibold">
              {profile.full_name || profile.username}
            </span>
            <span className="block truncate text-sm leading-none text-gray-500">
              @{profile.username}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="bottom" align="start">
        <DropdownMenuItem asChild>
          <Link href={`/${profile.username}`}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface SidebarLinkProps {
  label: string;
  href?: string;
}

const SidebarLink: FC<SidebarLinkProps> = ({ label, href }) => {
  if (href) {
    return (
      <Link href={href} className="hover:underline">
        {label}
      </Link>
    );
  }

  return (
    <a href="#" className="hover:underline">
      {label}
    </a>
  );
};
