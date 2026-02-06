-- Drop existing item-specific columns from purchase_requisitions
ALTER TABLE public.purchase_requisitions
DROP COLUMN IF EXISTS item_description,
DROP COLUMN IF EXISTS quantity;

-- Create the new table for purchase requisition items
CREATE TABLE public.purchase_requisition_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id uuid NOT NULL REFERENCES public.purchase_requisitions(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  item_description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for the new table
ALTER TABLE public.purchase_requisition_items ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert items
CREATE POLICY "Allow authenticated users to insert purchase requisition items"
ON public.purchase_requisition_items FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy to allow authenticated users to view items
CREATE POLICY "Allow authenticated users to view purchase requisition items"
ON public.purchase_requisition_items FOR SELECT
TO authenticated
USING (true);
