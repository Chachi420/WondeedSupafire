-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: Arena — leaderboard + season stats
-- Run this in Supabase SQL editor (Database → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────
-- Powers the public league table (/leaderboard) and the clipper dashboard
-- "Your Season" card. All functions are SECURITY DEFINER (read-only
-- aggregates, no PII beyond display name) with explicit grants.

-- ── Helper: start of week in IST (Monday 00:00 IST), with week offset ────────
CREATE OR REPLACE FUNCTION week_start_ist(p_offset_weeks INT DEFAULT 0)
RETURNS TIMESTAMPTZ
LANGUAGE sql IMMUTABLE AS $$
  SELECT (date_trunc('week', (NOW() AT TIME ZONE 'Asia/Kolkata') + (p_offset_weeks || ' weeks')::interval)) AT TIME ZONE 'Asia/Kolkata'
$$;

-- ── Helper: tier from lifetime credited earnings ─────────────────────────────
CREATE OR REPLACE FUNCTION clipper_tier(p_lifetime NUMERIC)
RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_lifetime >= 50000 THEN 'legend'
    WHEN p_lifetime >= 5000  THEN 'pro'
    ELSE 'rookie'
  END
$$;

-- ── RPC: get_leaderboard ─────────────────────────────────────────────────────
-- p_period: 'weekly' (Mon 00:00 IST → now) or 'all_time'.
-- movement: rank delta vs previous week (positive = climbed). NULL for
-- new entrants and for all_time.
CREATE OR REPLACE FUNCTION get_leaderboard(p_period TEXT DEFAULT 'weekly')
RETURNS TABLE (
  rank          INT,
  clipper_id    UUID,
  display_name  TEXT,
  total_earned  NUMERIC,
  total_views   BIGINT,
  submissions   INT,
  movement      INT,
  tier          TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start      TIMESTAMPTZ;
  v_prev_start TIMESTAMPTZ;
BEGIN
  IF p_period = 'weekly' THEN
    v_start      := week_start_ist(0);
    v_prev_start := week_start_ist(-1);
  ELSE
    v_start      := '1970-01-01'::timestamptz;
    v_prev_start := NULL;
  END IF;

  RETURN QUERY
  WITH cur AS (
    SELECT e.clipper_id,
           SUM(e.amount_inr)::NUMERIC          AS earned,
           COALESCE(SUM(s.capped_view_count), 0)::BIGINT AS views,
           COUNT(*)::INT                       AS subs
    FROM earnings e
    LEFT JOIN campaign_submissions s ON s.id = e.submission_id
    WHERE e.status = 'credited'
      AND e.created_at >= v_start
    GROUP BY e.clipper_id
  ),
  prev AS (
    SELECT e.clipper_id,
           SUM(e.amount_inr)::NUMERIC AS earned
    FROM earnings e
    WHERE e.status = 'credited'
      AND v_prev_start IS NOT NULL
      AND e.created_at >= v_prev_start
      AND e.created_at < v_start
    GROUP BY e.clipper_id
  ),
  ranked_cur AS (
    SELECT *, ROW_NUMBER() OVER (ORDER BY earned DESC, clipper_id) AS rnk FROM cur
  ),
  ranked_prev AS (
    SELECT *, ROW_NUMBER() OVER (ORDER BY earned DESC, clipper_id) AS rnk FROM prev
  ),
  lifetime AS (
    SELECT e.clipper_id, SUM(e.amount_inr)::NUMERIC AS total
    FROM earnings e
    WHERE e.status = 'credited'
    GROUP BY e.clipper_id
  )
  SELECT rc.rnk::INT,
         rc.clipper_id,
         p.full_name,
         rc.earned,
         rc.views,
         rc.subs,
         (rp.rnk - rc.rnk)::INT,
         clipper_tier(COALESCE(l.total, 0))
  FROM ranked_cur rc
  LEFT JOIN ranked_prev rp ON rp.clipper_id = rc.clipper_id
  LEFT JOIN lifetime   l  ON l.clipper_id  = rc.clipper_id
  LEFT JOIN profiles   p  ON p.id          = rc.clipper_id
  ORDER BY rc.rnk
  LIMIT 50;
END $$;

-- ── RPC: get_clipper_season ──────────────────────────────────────────────────
-- Single clipper's season snapshot for the dashboard "Your Season" card.
CREATE OR REPLACE FUNCTION get_clipper_season(p_clipper_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start        TIMESTAMPTZ := week_start_ist(0);
  v_weekly       NUMERIC := 0;
  v_views        BIGINT  := 0;
  v_rank         INT;
  v_lifetime     NUMERIC := 0;
  v_tier         TEXT;
  v_next         TEXT;
  v_progress     NUMERIC;
  v_streak       INT := 0;
  v_w            INT := 0;
  v_has          BOOLEAN;
BEGIN
  SELECT COALESCE(SUM(amount_inr), 0)
    INTO v_weekly
  FROM earnings
  WHERE clipper_id = p_clipper_id AND status = 'credited' AND created_at >= v_start;

  SELECT COALESCE(SUM(s.capped_view_count), 0)
    INTO v_views
  FROM earnings e
  LEFT JOIN campaign_submissions s ON s.id = e.submission_id
  WHERE e.clipper_id = p_clipper_id AND e.status = 'credited' AND e.created_at >= v_start;

  IF v_weekly > 0 THEN
    SELECT COUNT(*) + 1 INTO v_rank FROM (
      SELECT e.clipper_id
      FROM earnings e
      WHERE e.status = 'credited' AND e.created_at >= v_start
      GROUP BY e.clipper_id
      HAVING SUM(e.amount_inr) > v_weekly
    ) t;
  ELSE
    v_rank := NULL;
  END IF;

  SELECT COALESCE(SUM(amount_inr), 0)
    INTO v_lifetime
  FROM earnings
  WHERE clipper_id = p_clipper_id AND status = 'credited';

  v_tier := clipper_tier(v_lifetime);
  IF v_tier = 'rookie' THEN
    v_next := 'pro';    v_progress := LEAST(v_lifetime / 5000, 1);
  ELSIF v_tier = 'pro' THEN
    v_next := 'legend'; v_progress := LEAST((v_lifetime - 5000) / 45000, 1);
  ELSE
    v_next := NULL;     v_progress := 1;
  END IF;

  -- streak: consecutive weeks (incl. current) with ≥1 credited earning
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM earnings
      WHERE clipper_id = p_clipper_id
        AND status = 'credited'
        AND created_at >= week_start_ist(-v_w)
        AND created_at <  week_start_ist(-v_w + 1)
    ) INTO v_has;
    EXIT WHEN NOT v_has OR v_w > 520;
    v_streak := v_streak + 1;
    v_w := v_w + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'rank',            v_rank,
    'weekly_earned',   v_weekly,
    'weekly_views',    v_views,
    'streak_weeks',    v_streak,
    'tier',            v_tier,
    'next_tier',       v_next,
    'progress',        ROUND(v_progress::numeric, 3),
    'lifetime_earned', v_lifetime
  );
END $$;

-- ── Grants (browser client uses the anon key) ────────────────────────────────
GRANT EXECUTE ON FUNCTION get_leaderboard(TEXT)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_clipper_season(UUID)   TO anon, authenticated;
