-- =====================================================
-- PUBLIC UNSUBSCRIBE
-- =====================================================
-- Campaign emails carry an unsubscribe link that an
-- anonymous recipient clicks. Since subscribers are now
-- privately owned per-user, an unauthenticated visitor
-- can't directly UPDATE a subscribers row. This RPC lets
-- them flip their own status to 'unsubscribed' for a
-- specific sender only (scoped by owner id from the link),
-- without granting any broader read/write access.
-- =====================================================

CREATE OR REPLACE FUNCTION public.unsubscribe_email(
  p_email TEXT,
  p_owner_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.subscribers
  SET status = 'unsubscribed'
  WHERE email = p_email AND user_id = p_owner_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.unsubscribe_email(TEXT, UUID) TO anon, authenticated;
