
-- Create the matching_student_try table to track student attempts
CREATE TABLE public.matching_student_try (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matching_id TEXT NOT NULL REFERENCES public.matching(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_matches JSONB DEFAULT '{}',
  correct_matches JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  total_pairs INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  is_correct BOOLEAN DEFAULT false,
  time_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  time_end TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.matching_student_try ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own attempts
CREATE POLICY "Users can view their own matching attempts" 
  ON public.matching_student_try 
  FOR SELECT 
  USING (student_id = auth.uid()::text);

-- Create policy that allows users to insert their own attempts
CREATE POLICY "Users can create their own matching attempts" 
  ON public.matching_student_try 
  FOR INSERT 
  WITH CHECK (student_id = auth.uid()::text);

-- Create policy that allows users to update their own attempts
CREATE POLICY "Users can update their own matching attempts" 
  ON public.matching_student_try 
  FOR UPDATE 
  USING (student_id = auth.uid()::text);

-- Create indexes for better performance
CREATE INDEX idx_matching_student_try_matching_id ON public.matching_student_try(matching_id);
CREATE INDEX idx_matching_student_try_student_id ON public.matching_student_try(student_id);
CREATE INDEX idx_matching_student_try_created_at ON public.matching_student_try(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_matching_student_try_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_matching_student_try_updated_at
  BEFORE UPDATE ON public.matching_student_try
  FOR EACH ROW
  EXECUTE FUNCTION update_matching_student_try_updated_at();
