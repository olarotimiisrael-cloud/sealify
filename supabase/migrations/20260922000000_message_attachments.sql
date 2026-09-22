-- Message attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id),
  filename text NOT NULL,
  mime_type text,
  size bigint,
  storage_bucket text NOT NULL,
  storage_path text NOT NULL,
  public_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX idx_message_attachments_uploaded_by ON public.message_attachments(uploaded_by);

ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments for their conversations"
  ON public.message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_attachments.message_id
      AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert attachments to their own messages"
  ON public.message_attachments FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Uploaders can delete their attachments"
  ON public.message_attachments FOR DELETE
  USING (uploaded_by = auth.uid());
