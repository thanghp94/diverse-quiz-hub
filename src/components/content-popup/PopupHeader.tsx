
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { ArrowLeft, ArrowRight, HelpCircle, Languages, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Content } from "@/hooks/useContent";

interface PopupHeaderProps {
  contentListLength: number;
  currentIndex: number;
  handlePrevious: () => void;
  handleNext: () => void;
  startQuiz: (level?: 'Easy' | 'Hard') => void;
  translation: Content['translation'];
}

export const PopupHeader = ({
  contentListLength,
  currentIndex,
  handlePrevious,
  handleNext,
  startQuiz,
  translation
}: PopupHeaderProps) => {
  const [isTranslationPopoverOpen, setIsTranslationPopoverOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
            <Button onClick={handlePrevious} disabled={currentIndex <= 0} size="sm">
                <ArrowLeft className="h-4 w-4" />
                Previous
            </Button>
            <Button onClick={handleNext} disabled={contentListLength === 0 || currentIndex >= contentListLength - 1} size="sm">
                Next
                <ArrowRight className="h-4 w-4" />
            </Button>
            {contentListLength > 0 && <div className="text-sm text-gray-500">
                {currentIndex + 1} / {contentListLength}
            </div>}
        </div>
    
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <HelpCircle className="h-4 w-4" />
                        Quiz
                        <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => startQuiz()}>All Questions</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => startQuiz('Easy')}>Easy Quiz</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => startQuiz('Hard')}>Hard Quiz</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Popover open={isTranslationPopoverOpen} onOpenChange={setIsTranslationPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Languages className="h-4 w-4" />
                        Translation
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-80 max-w-xs">
                    <Card className="border-0 shadow-none">
                        <CardHeader>
                            <h3 className="font-semibold text-lg">Translation</h3>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {translation ? <MarkdownRenderer className="text-sm">
                                    {translation}
                                </MarkdownRenderer> : <div className="text-gray-500 text-sm">No translation available for this content.</div>}
                        </CardContent>
                    </Card>
                </PopoverContent>
            </Popover>
        </div>
    </div>
  );
};
