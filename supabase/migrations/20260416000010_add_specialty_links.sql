-- Add link_url column to specialties for interactive landing page navigation
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Update RLS if necessary (it should already be covered by 'Admins can modify specialties')
COMMENT ON COLUMN specialties.link_url IS 'Optional URL to redirect to when the specialty card is clicked (e.g., /shop?category=uuid or /print-portal)';
