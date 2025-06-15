
export interface Question {
  id: string;
  question: string;
  type: string;
  pairs?: { left: string; right: string }[];
}
