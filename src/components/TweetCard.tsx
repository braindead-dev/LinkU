import Image from "next/image";
import { FC } from "react";

interface TweetCardProps {
  name: string;
  handle: string;
  content: string;
  image?: string;
}

/**
 * TweetCard – displays a single tweet/post.
 */
const TweetCard: FC<TweetCardProps> = ({ name, handle, content, image }) => (
  <article className="flex gap-4 p-4 border-b border-gray-200 dark:border-neutral-800">
    {/* Avatar */}
    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
    <div className="flex-1">
      <header className="flex gap-2 items-baseline">
        <h3 className="font-semibold leading-none">{name}</h3>
        <span className="text-sm text-gray-500 leading-none">@{handle}</span>
      </header>
      <p className="mt-1 whitespace-pre-wrap text-sm/relaxed">{content}</p>
      {image && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800">
          <Image src={image} alt="tweet image" width={500} height={300} className="w-full h-auto" />
        </div>
      )}
      <footer className="mt-3 text-sm text-gray-500">533  •  18K  •  2.5M</footer>
    </div>
  </article>
);

export default TweetCard; 