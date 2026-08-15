// ============================================================
// CLUB ATLÉTICO CAMPITO — Edge Function: admin-users
// Capa server-side para gestión de colaboradores.
//
// Flujo: Admin CMS -> Edge Function -> Supabase Auth Admin API
//        -> auth.users -> trigger handle_new_user -> public.users
//
// Seguridad:
//  - El JWT del usuario autenticado se verifica con getUser().
//  - Solo role 'admin' (public.users) puede ejecutar acciones.
//  - El service_role key se lee de variables de entorno del runtime
//    (NUNCA se expone al navegador).
//  - No existe parámetro de rol: los usuarios nacen SIEMPRE 'colaborador'.
//  - El admin no puede desactivarse/eliminarse a sí mismo.
//
// Deploy:
//  supabase functions deploy admin-users --project-ref <ref>
// ============================================================

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function serviceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

async function verifyAdmin(authorization: string | null): Promise<string | null> {
  if (!authorization) return null

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authorization } },
  })
  const { data: { user }, error } = await authClient.auth.getUser()
  if (error || !user) return null

  const client = serviceClient()
  const { data: profile } = await client
    .from('users')
    .select('id')
    .eq('id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  return profile ? user.id : null
}

async function handle(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'método no permitido' }, 405)
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: 'configuración inválida del servidor' }, 500)
  }

  const adminId = await verifyAdmin(req.headers.get('Authorization'))
  if (!adminId) {
    return json({ error: 'no autorizado' }, 403)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'body inválido' }, 400)
  }

  const supabase = serviceClient()
  const action = String(body.action ?? '')

  try {
    switch (action) {
      case 'list': {
        const { data: profiles, error: pErr } = await supabase
          .from('users')
          .select('id, name, email, role, created_at')
        if (pErr) return json({ error: pErr.message }, 500)

        const { data: authList, error: aErr } = await supabase.auth.admin.listUsers()
        if (aErr) return json({ error: aErr.message }, 500)

        const now = Date.now()
        const authById = new Map((authList?.users ?? []).map(u => [u.id, u]))
        const rows = (profiles ?? []).map(p => {
          const au = authById.get(p.id)
          const banned = !!au?.banned_until && new Date(au.banned_until).getTime() > now
          return {
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role,
            created_at: p.created_at,
            banned,
          }
        })
        rows.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        return json(rows)
      }

      case 'create': {
        const name = String(body.name ?? '').trim()
        const email = String(body.email ?? '').trim()
        const password = String(body.password ?? '')
        if (!name || !email) return json({ error: 'nombre y email son obligatorios' }, 400)
        if (password.length < 6) {
          return json({ error: 'la contraseña debe tener al menos 6 caracteres' }, 400)
        }

        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name },
        })
        if (error) return json({ error: error.message }, 400)

        await supabase.from('users').upsert(
          {
            id: data.user.id,
            name,
            email,
            role: 'colaborador',
          },
          { onConflict: 'id' }
        )
        return json({ ok: true, id: data.user.id })
      }

      case 'update': {
        const id = String(body.id ?? '')
        const name = String(body.name ?? '').trim()
        const email = String(body.email ?? '').trim()
        if (!id || !name || !email) return json({ error: 'faltan datos' }, 400)

        const { error } = await supabase.auth.admin.updateUserById(id, {
          email,
          user_metadata: { name },
        })
        if (error) return json({ error: error.message }, 400)

        await supabase.from('users').update({ name, email }).eq('id', id)
        return json({ ok: true })
      }

      case 'updatePassword': {
        const id = String(body.id ?? '')
        const password = String(body.password ?? '')
        if (!id) return json({ error: 'faltan datos' }, 400)
        if (password.length < 6) {
          return json({ error: 'la contraseña debe tener al menos 6 caracteres' }, 400)
        }

        const { error } = await supabase.auth.admin.updateUserById(id, { password })
        if (error) return json({ error: error.message }, 400)
        return json({ ok: true })
      }

      case 'setBanned': {
        const id = String(body.id ?? '')
        const banned = Boolean(body.banned)
        if (!id) return json({ error: 'faltan datos' }, 400)
        if (id === adminId) {
          return json({ error: 'no podés desactivar tu propio usuario' }, 400)
        }

        const { error } = await supabase.auth.admin.updateUserById(id, {
          ban_duration: banned ? '876000 hours' : 'none',
        })
        if (error) return json({ error: error.message }, 400)
        return json({ ok: true })
      }

      case 'delete': {
        const id = String(body.id ?? '')
        if (!id) return json({ error: 'faltan datos' }, 400)
        if (id === adminId) {
          return json({ error: 'no podés eliminar tu propio usuario' }, 400)
        }

        const { error } = await supabase.auth.admin.deleteUser(id)
        if (error) return json({ error: error.message }, 400)
        return json({ ok: true })
      }

      default:
        return json({ error: `acción desconocida: ${action}` }, 400)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error interno'
    return json({ error: msg }, 500)
  }
}

Deno.serve(handle)