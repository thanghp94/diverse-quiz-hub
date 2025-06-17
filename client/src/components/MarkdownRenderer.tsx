
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
  <div className={`prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap font-sans prose-li:my-0 prose-p:my-0.5 prose-p:mb-1 ${className}`}>
    <ReactMarkdown>{children}</ReactMarkdown>
  </div>
);

export default MarkdownRenderer;
