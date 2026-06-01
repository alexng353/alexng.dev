// Drafts only ever render in local dev (the loader excludes them from
// production), so this badge is just a visual cue while writing.
export function DraftBadge() {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400">
      Draft
    </span>
  );
}
