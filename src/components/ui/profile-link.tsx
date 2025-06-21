import Image from "next/image";

export function ProfileLink() {
  return (
    <div className="flex cursor-pointer items-center gap-3 rounded-full p-3 hover:bg-gray-100">
      <Image
        src="/profile-pic.png" // Placeholder image
        alt="Profile picture"
        width={40}
        height={40}
        className="rounded-full"
      />
      <div className="hidden xl:block">
        <p className="font-bold">henry</p>
        <p className="text-gray-500">@henry0284928382</p>
      </div>
    </div>
  );
}
