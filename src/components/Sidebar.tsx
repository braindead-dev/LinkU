"use client";

import { FC } from "react";
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { House, MessageSquare, User, LogOut } from "lucide-react";
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
  unreadCount?: number;
}

/**
 * Sidebar – renders the left column with profile information.
 * Only visible on medium screens and up.
 */
const Sidebar: FC<SidebarProps> = ({ profile, unreadCount = 0 }) => {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-60 gap-2 border-r border-gray-200 p-4 md:flex md:flex-col dark:border-neutral-800">
      <LogoSection />
      <nav className="flex flex-col gap-4 text-xl font-medium">
        <SidebarLink
          label="Home"
          href="/"
          icon={<House className="h-6 w-6" />}
        />
        <SidebarLink
          label="Messages"
          href="/messages"
          icon={
            <div className="relative">
              <MessageSquare className="h-6 w-6" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-1 border-white bg-red-500 text-[10px] font-medium text-white">
                  <span
                    className={unreadCount > 9 ? "text-[8px]" : "text-[10px]"}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </div>
              )}
            </div>
          }
        />
      </nav>
      <div className="mt-auto -ml-4">
        <ProfileSection profile={profile} onSignOut={handleSignOut} />
      </div>
    </aside>
  );
};

export default Sidebar;

// Helpers
const LogoSection: FC = () => {
  return (
    <div className="flex justify-start pl-1">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo"
          width={85}
          height={50}
          className="h-auto"
        />
      </Link>
    </div>
  );
};

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
            <span className="block truncate leading-none font-semibold mb-1">
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
          <Link href={`/${profile.username}`}>
            <User className="h-4 w-4 text-black" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOut className="h-4 w-4 text-red-500" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface SidebarLinkProps {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

const SidebarLink: FC<SidebarLinkProps> = ({ label, href, icon }) => {
  const linkContent = (
    <div className="flex items-center gap-3">
      {icon}
      {label}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:underline">
        {linkContent}
      </Link>
    );
  }

  return (
    <a href="#" className="hover:underline">
      {linkContent}
    </a>
  );
};
