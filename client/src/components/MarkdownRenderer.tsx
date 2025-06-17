
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
  <div className={`prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap font-sans prose-li:my-0 prose-li:mb-0 prose-li:leading-none prose-li:pl-0 prose-p:my-0 prose-p:mb-0 prose-p:leading-tight prose-ul:my-0 prose-ul:mb-0 prose-ul:pl-1 prose-ul:mt-0 prose-ol:my-0 prose-ol:mb-0 prose-ol:pl-1 prose-ol:mt-0 ${className}`} style={{ lineHeight: '1.1' }}>
    <ReactMarkdown>{children}</ReactMarkdown>
  </div>
);

export default MarkdownRenderer;
