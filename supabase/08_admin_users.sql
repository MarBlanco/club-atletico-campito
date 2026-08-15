-- ============================================================
-- CLUB ATLÉTICO CAMPITO — Fase 2.6: Gestión de colaboradores (Admin)
-- RPC SECURITY DEFINER sobre auth.admin.* (GoTrue) + public.users
-- Solo admin (is_admin). El rol se crea SIEMPRE 'colaborador'.
-- El frontend nunca expone service_role ni credenciales privilegiadas.
-- ============================================================

-- ------------------------------------------------------------
-- admin_list_users
-- Lista de perfiles con estado de baneo (desactivación) real
-- de auth.users. Sin exposición de auth.users al cliente.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (id uuid, name text, email text, role text, created_at timestamptz, banned boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'no autorizado';
  END IF;

  RETURN QUERY
    SELECT u.id, u.name, u.email, u.role, u.created_at,
           COALESCE(a.banned_until IS NOT NULL AND a.banned_until > now(), false) AS banned
    FROM public.users u
    LEFT JOIN auth.users a ON a.id = u.id
    ORDER BY u.created_at ASC;
END;
$$;

-- ------------------------------------------------------------
-- admin_create_user
-- Crea en auth.users vía GoTrue admin y sincroniza public.users.
-- Rol inicial SIEMPRE 'colaborador' (trigger handle_new_user + sync defensivo).
-- No existe parámetro de rol: es imposible crear un admin desde el flujo.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_create_user(p_name text, p_email text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _result jsonb;
  _uid uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'no autorizado';
  END IF;

  IF p_email IS NULL OR p_email = '' OR position('@' IN p_email) = 0 THEN
    RAISE EXCEPTION 'email inválido';
  END IF;

  IF p_password IS NULL OR char_length(p_password) < 6 THEN
    RAISE EXCEPTION 'la contraseña debe tener al menos 6 caracteres';
  END IF;

  -- Compatible con GoTrue moderno (create_user_v2) y versiones previas.
  IF to_regprocedure('auth.admin.create_user(jsonb, jsonb, jsonb)') IS NOT NULL THEN
    SELECT auth.admin.create_user(
      jsonb_build_object('name', p_name),
      '{}'::jsonb,
      jsonb_build_object('email', p_email, 'password', p_password, 'email_confirm', true)
    ) INTO _result;
  ELSE
    SELECT auth.admin.create_user_v2(
      jsonb_build_object('name', p_name),
      '{}'::jsonb,
      jsonb_build_object('email', p_email, 'password', p_password, 'email_confirm', true)
    ) INTO _result;
  END IF;

  _uid := (_result->>'id')::uuid;

  -- Sync defensivo del perfil (misma forma que ensure_user_profile):
  -- garantiza la relación 1:1 con public.users aunque el trigger no haya corrido.
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    _uid,
    COALESCE(NULLIF(p_name, ''), split_part(p_email, '@', 1)),
    p_email,
    'colaborador'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN _uid;
END;
$$;

-- ------------------------------------------------------------
-- admin_update_user
-- Actualiza nombre/email en auth.users y en public.users.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_user(p_id uuid, p_name text, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'no autorizado';
  END IF;

  IF p_id IS NULL THEN
    RAISE EXCEPTION 'usuario requerido';
  END IF;

  PERFORM auth.admin.update_user_by_id(
    p_id,
    jsonb_build_object('email', p_email, 'user_metadata', jsonb_build_object('name', p_name))
  );

  UPDATE public.users
  SET name = p_name, email = p_email
  WHERE id = p_id;
END;
$$;

-- ------------------------------------------------------------
-- admin_update_user_password
-- Cambia la contraseña en auth.users. Nunca se devuelve la existente.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_user_password(p_id uuid, p_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'no autorizado';
  END IF;

  IF p_password IS NULL OR char_length(p_password) < 6 THEN
    RAISE EXCEPTION 'la contraseña debe tener al menos 6 caracteres';
  END IF;

  PERFORM auth.admin.update_user_by_id(p_id, jsonb_build_object('password', p_password));
END;
$$;

-- ------------------------------------------------------------
-- admin_set_user_banned
-- Desactiva (ban de 100 años) o reactiva el acceso en GoTrue.
-- Impide que el admin se desactive a sí mismo.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_user_banned(p_id uuid, p_banned boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'no autorizado';
  END IF;

  IF p_id IS NULL OR p_id = auth.uid() THEN
    RAISE EXCEPTION 'no podés desactivar tu propio usuario';
  END IF;

  IF p_banned THEN
    PERFORM auth.admin.update_user_by_id(p_id, jsonb_build_object('ban_duration', '876000 hours'));
  ELSE
    PERFORM auth.admin.update_user_by_id(p_id, jsonb_build_object('ban_duration', 'none'));
  END IF;
END;
$$;

-- ------------------------------------------------------------
-- admin_delete_user
-- Elimina de auth.users (cascada a public.users por FK).
-- Impide que el admin se elimine a sí mismo.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'no autorizado';
  END IF;

  IF p_id IS NULL OR p_id = auth.uid() THEN
    RAISE EXCEPTION 'no podés eliminar tu propio usuario';
  END IF;

  PERFORM auth.admin.delete_user(p_id);
END;
$$;

-- ------------------------------------------------------------
-- Permisos: solo usuarios autenticados pueden invocar.
-- El gate real es is_admin() dentro de cada función.
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_create_user(text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_update_user_password(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_banned(uuid, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_user(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_password(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_banned(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;