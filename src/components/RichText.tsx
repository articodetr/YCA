import React from 'react';

type RenderMode = 'inline' | 'paragraphs';

interface RichTextProps {
  text: string;
  /**
   * - inline: renders a single inline block with clickable links
   * - paragraphs: splits by new lines and renders <p> blocks (like article content)
   */
  mode?: RenderMode;
  className?: string;
  paragraphClassName?: string;
  linkClassName?: string;
  /**
   * Wrapper element for inline mode (default: span)
   */
  as?: keyof JSX.IntrinsicElements;
}

const DEFAULT_LINK_CLASS = 'text-primary underline hover:text-accent transition-colors';

const isSafeUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'mailto:';
  } catch {
    return false;
  }
};

const normalizeUrl = (raw: string) => {
  const trimmed = raw.trim();
  if (trimmed.startsWith('www.')) return `https://${trimmed}`;
  return trimmed;
};

// Supports:
// 1) Markdown links: [text](https://example.com)
// 2) Plain links: https://example.com or www.example.com
const LINK_REGEX = /\[([^\]]+)\]\(([^\s)]+)\)|(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

function parseInline(text: string, linkClassName?: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  if (!text) return nodes;

  let lastIndex = 0;
  const matches = text.matchAll(LINK_REGEX);

  for (const match of matches) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    const mdLabel = match[1];
    const mdUrl = match[2];
    const httpUrl = match[3];
    const wwwUrl = match[4];

    const label = mdLabel ?? httpUrl ?? wwwUrl ?? '';
    const rawUrl = mdUrl ?? httpUrl ?? wwwUrl ?? '';
    const href = normalizeUrl(rawUrl);

    if (!href || !isSafeUrl(href)) {
      // If something suspicious is typed, render it as plain text.
      nodes.push(match[0]);
    } else {
      nodes.push(
        <a
          key={`${index}-${href}`}
          href={href}
          target={href.startsWith('mailto:') ? undefined : '_blank'}
          rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          className={linkClassName || DEFAULT_LINK_CLASS}
        >
          {label}
        </a>
      );
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default function RichText({
  text,
  mode = 'inline',
  className,
  paragraphClassName,
  linkClassName,
  as,
}: RichTextProps) {
  if (mode === 'paragraphs') {
    const paragraphs = (text || '').split('\n').filter((p) => p.trim().length > 0);
    return (
      <div className={className}>
        {paragraphs.map((p, i) => (
          <p key={i} className={paragraphClassName}>
            {parseInline(p, linkClassName)}
          </p>
        ))}
      </div>
    );
  }

  const Wrapper = (as || 'span') as any;
  return <Wrapper className={className}>{parseInline(text || '', linkClassName)}</Wrapper>;
}
