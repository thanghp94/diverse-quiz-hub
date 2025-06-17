
import React from "react";
import ReactMarkdown from "react-markdown";

/**
 * MarkdownRenderer
 * Wraps ReactMarkdown with Tailwind `prose` classes for beautiful formatting.
 */
export const MarkdownRenderer = ({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) => (
  <div className={`prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap font-sans prose-li:my-0 prose-li:mb-0 prose-li:leading-tight prose-p:my-0 prose-p:mb-0.5 prose-p:leading-tight prose-ul:my-0 prose-ol:my-0 ${className}`} style={{ lineHeight: '1.3' }}>
    <ReactMarkdown>{children}</ReactMarkdown>
  </div>
);

export default MarkdownRenderer;
