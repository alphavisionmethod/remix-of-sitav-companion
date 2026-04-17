-- Auto-install pinned_default apps for new users + backfill existing users.

-- 1. SECURITY DEFINER function that seeds default apps for a given user.
CREATE OR REPLACE FUNCTION public.seed_default_installed_apps(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_record record;
  pin_idx integer := 0;
BEGIN
  FOR app_record IN
    SELECT app_id, pinned_default, version, latest_version, sort_order
    FROM public.apps
    WHERE enabled = true
      AND (pinned_default = true OR installability = 'preinstalled')
    ORDER BY sort_order ASC, app_id ASC
  LOOP
    INSERT INTO public.installed_apps (
      user_id, app_id, install_status, enabled, pinned, favorite,
      pinned_order, launch_count, version_installed, source_channel,
      permissions_granted, config_json
    ) VALUES (
      _user_id,
      app_record.app_id,
      'installed',
      true,
      app_record.pinned_default,
      false,
      CASE WHEN app_record.pinned_default THEN pin_idx ELSE 0 END,
      0,
      COALESCE(app_record.latest_version, app_record.version, '1.0.0'),
      'system_default',
      '[]'::jsonb,
      '{}'::jsonb
    )
    ON CONFLICT (user_id, app_id) DO NOTHING;

    IF app_record.pinned_default THEN
      pin_idx := pin_idx + 1;
    END IF;
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'seed_default_installed_apps failed for %: %', _user_id, SQLERRM;
END;
$$;

-- 2. Trigger function — fires on new auth.users insert (in addition to existing handle_new_user).
CREATE OR REPLACE FUNCTION public.handle_new_user_default_apps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_default_installed_apps(NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user_default_apps failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 3. Attach trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created_default_apps ON auth.users;
CREATE TRIGGER on_auth_user_created_default_apps
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_default_apps();

-- 4. Backfill existing users
DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT id FROM auth.users LOOP
    PERFORM public.seed_default_installed_apps(u.id);
  END LOOP;
END $$;