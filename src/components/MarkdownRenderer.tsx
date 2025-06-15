
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
  <div className={`prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap font-sans ${className}`}>
    <ReactMarkdown>{children}</ReactMarkdown>
  </div>
);

export default MarkdownRenderer;
