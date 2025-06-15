
-- Enable Row Level Security on the assignment_student_try table if it's not already.
ALTER TABLE public.assignment_student_try ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows any user (including anonymous) to insert into assignment_student_try.
-- This is a temporary measure until a proper authentication system is in place.
CREATE POLICY "Allow insert for all users"
ON public.assignment_student_try
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create a policy that allows any user to view any assignment try.
-- In a real app, this would be restricted to the user who created it, using (auth.uid() = hocsinh_id).
CREATE POLICY "Allow select for all users"
ON public.assignment_student_try
FOR SELECT
USING (true);

-- Create a policy that allows any user to update any assignment try.
CREATE POLICY "Allow update for all users"
ON public.assignment_student_try
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create a policy that allows any user to delete any assignment try.
CREATE POLICY "Allow delete for all users"
ON public.assignment_student_try
FOR DELETE
USING (true);

