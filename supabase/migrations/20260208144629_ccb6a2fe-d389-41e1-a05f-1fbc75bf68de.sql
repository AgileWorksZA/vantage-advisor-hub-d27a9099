
-- Add missing foreign key from documents.workflow_id to workflows.id
ALTER TABLE documents
  ADD CONSTRAINT documents_workflow_id_fkey
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
  ON DELETE SET NULL;

-- Add document_id column to email_attachments so attachments can link to client documents
ALTER TABLE email_attachments
  ADD COLUMN document_id UUID REFERENCES documents(id) ON DELETE SET NULL;
