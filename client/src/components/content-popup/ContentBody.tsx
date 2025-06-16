
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Content } from "@/hooks/useContent";

interface ContentBodyProps {
  content: Content;
}

export const ContentBody = ({ content }: ContentBodyProps) => {
  const [isSecondBlurbOpen, setIsSecondBlurbOpen] = useState(false);

  return (
    <div className="space-y-6">
      {content.short_blurb && <Card>
        <CardHeader>
            <h3 className="font-semibold text-xl break-words">Short Blurb</h3>
        </CardHeader>
        <CardContent className="pb-8">
            <MarkdownRenderer className="text-base leading-relaxed">
                {content.short_blurb}
            </MarkdownRenderer>
        </CardContent>
      </Card>}

      {content.second_short_blurb && <Card>
        <Collapsible open={isSecondBlurbOpen} onOpenChange={setIsSecondBlurbOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left rounded-lg hover:bg-muted/50">
                <h3 className="font-semibold text-xl break-words">Second Short Blurb</h3>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isSecondBlurbOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
                <CardContent className="pt-0 pb-8 px-6">
                    <MarkdownRenderer className="text-base leading-relaxed">
                        {content.second_short_blurb}
                    </MarkdownRenderer>
                </CardContent>
            </CollapsibleContent>
        </Collapsible>
      </Card>}

      {content.short_description && <Card>
          <CardHeader>
              <h3 className="font-semibold text-xl break-words">Description</h3>
          </CardHeader>
          <CardContent className="pb-8">
              <MarkdownRenderer className="text-base leading-relaxed">
                  {content.short_description}
              </MarkdownRenderer>
          </CardContent>
      </Card>}

      {(content.translation || content.vocabulary) && <Card>
          <CardHeader>
              <h3 className="font-semibold text-xl break-words">Language Support</h3>
          </CardHeader>
          <CardContent className="pb-8">
              {content.translation && <div className="mb-4">
                  <h4 className="font-medium text-base text-gray-600 mb-2">Translation:</h4>
                  <MarkdownRenderer className="text-base leading-relaxed">
                      {content.translation}
                  </MarkdownRenderer>
              </div>}
              
              {content.vocabulary && <div>
                  <h4 className="font-medium text-base text-gray-600 mb-2">Vocabulary:</h4>
                  <MarkdownRenderer className="text-base leading-relaxed">
                      {content.vocabulary}
                  </MarkdownRenderer>
              </div>}
          </CardContent>
      </Card>}

      {content.url && <Card>
          <CardHeader>
              <h3 className="font-semibold text-lg">External Link</h3>
          </CardHeader>
          <CardContent>
              <a href={content.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                  {content.url}
              </a>
          </CardContent>
      </Card>}
    </div>
  );
};
