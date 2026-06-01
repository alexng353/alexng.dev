import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

// `prose` for light mode, `prose-invert` in dark; the overrides swap link
// colors to the site green and hand code blocks over to highlight.js, which
// paints its own (github-dark) background/padding — so code blocks stay dark
// cards in both themes.
const PROSE = [
  "prose dark:prose-invert max-w-none",
  "prose-a:text-green-600 dark:prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline",
  "prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:bg-transparent prose-pre:p-0",
  "prose-headings:scroll-mt-20",
].join(" ");

export function Markdown({ children }: { children: string }) {
  return (
    <div className={PROSE}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
