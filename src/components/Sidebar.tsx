import Image from "next/image";
import { FC } from "react";

/**
 * Sidebar – renders the left column with profile information.
 * Only visible on medium screens and up.
 */
const Sidebar: FC = () => {
  return (
    <aside className="hidden md:flex md:flex-col gap-6 w-60 p-4 border-r border-gray-200 dark:border-neutral-800 sticky top-0 h-screen">
      <ProfileSection />
      {/* Future navigation items can be added below */}
      <nav className="flex flex-col gap-4 text-lg font-medium">
        <SidebarLink label="Home" />
        <SidebarLink label="Messages" />
      </nav>
    </aside>
  );
};

export default Sidebar;

// Helpers
const ProfileSection: FC = () => (
  <div className="flex items-center gap-3">
    {/* Placeholder avatar */}
    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
    <div className="flex flex-col">
      <span className="font-semibold leading-none">henry</span>
      <span className="text-sm text-gray-500 leading-none">@henry0284928382</span>
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