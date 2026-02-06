CREATE TABLE public.purchase_requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  requested_by TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' NOT NULL, -- 'Pending', 'Approved', 'Rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.purchase_requisitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert purchase requisitions"
ON public.purchase_requisitions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view purchase requisitions"
ON public.purchase_requisitions FOR SELECT
TO authenticated
USING (true);
