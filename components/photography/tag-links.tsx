import { getTags } from "@lib/photos";
import Link from "next/link";

/**
 * Tag pills under the gallery caption. Rendered on the server from the
 * manifest, so every pill is a real prerendered page rather than client filter
 * state — shareable, crawlable, and correct with the back button.
 *
 * `active` is the tag whose page we're on, or undefined on /photography, where
 * "All" is the current view.
 */
export function TagLinks({ active }: { active?: string }) {
  const tags = getTags();
  if (tags.length === 0) return null;

  return (
    <nav aria-label="Filter photographs by tag" className="mt-4">
      <ul className="flex flex-wrap gap-2">
        <TagPill href="/photography" label="All" active={!active} />
        {tags.map(({ tag, count }) => (
          <TagPill
            key={tag}
            href={`/photography/${tag}`}
            label={tag}
            count={count}
            active={tag === active}
          />
        ))}
      </ul>
    </nav>
  );
}

function TagPill({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm capitalize transition-colors ${
          active
            ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
            : "border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-100"
        }`}
      >
        {label}
        {count !== undefined && (
          <span className="font-mono text-xs opacity-60">{count}</span>
        )}
      </Link>
    </li>
  );
}
