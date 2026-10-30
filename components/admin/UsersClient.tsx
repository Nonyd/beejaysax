'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import AdminSectionCard from '@/components/admin/AdminSectionCard'
import AdminFormField from '@/components/admin/AdminFormField'
import AdminInput from '@/components/admin/AdminInput'
import AdminToggle from '@/components/admin/AdminToggle'
import { PERMISSIONS, ROLES, type Role } from '@/lib/permissions'
import type { AdminUserView } from '@/lib/users'

type Form = {
  id?: string
  username: string
  email: string
  name: string
  password: string
  role: Role
  permissions: string[]
  active: boolean
}

const BLANK: Form = { username: '', email: '', name: '', password: '', role: 'STAFF', permissions: [], active: true }

function toForm(u: AdminUserView): Form {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.name ?? '',
    password: '',
    role: u.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STAFF',
    permissions: u.permissions,
    active: u.active,
  }
}

const PERMISSION_LABEL = new Map<string, string>(PERMISSIONS.map((p) => [p.key, p.label]))

function accessSummary(u: AdminUserView) {
  if (u.role === 'SUPER_ADMIN') return 'Everything'
  return u.permissions.map((p) => PERMISSION_LABEL.get(p) ?? p).join(', ') || 'No sections'
}

export default function UsersClient({ initial, currentUserId }: { initial: AdminUserView[]; currentUserId: string }) {
  const [users, setUsers] = useState(initial)
  const [form, setForm] = useState<Form | null>(null)
  const [busy, setBusy] = useState(false)

  const editing = Boolean(form?.id)
  const isSelf = form?.id === currentUserId
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => (f ? { ...f, [key]: value } : f))

  function togglePermission(key: string) {
    if (!form) return
    set('permissions', form.permissions.includes(key) ? form.permissions.filter((p) => p !== key) : [...form.permissions, key])
  }

  async function send(url: string, method: string, body?: unknown) {
    setBusy(true)
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
      setUsers(data.users)
      return true
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong.')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!form) return
    const { id, ...body } = form
    const ok = id ? await send(`/api/admin/users/${id}`, 'PATCH', body) : await send('/api/admin/users', 'POST', body)
    if (ok) {
      toast.success(id ? 'User saved' : `${form.username} can now sign in`)
      setForm(null)
    }
  }

  async function remove() {
    if (!form?.id || !confirm(`Delete ${form.username}? They will be signed out and cannot sign in again.`)) return
    if (await send(`/api/admin/users/${form.id}`, 'DELETE')) {
      toast.success('User deleted')
      setForm(null)
    }
  }

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      {!form && (
        <div className="flex justify-end">
          <button type="button" onClick={() => setForm(BLANK)} className="bg-gold px-6 py-3 font-semibold text-night">
            + Add user
          </button>
        </div>
      )}

      {form && (
        <AdminSectionCard
          title={editing ? `Edit ${form.username}` : 'Add a user'}
          description={editing ? undefined : 'Share the username and password with them yourself; no email is sent.'}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField label="Username">
              <AdminInput value={form.username} autoComplete="off" onChange={(e) => set('username', e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Email">
              <AdminInput type="email" value={form.email} autoComplete="off" onChange={(e) => set('email', e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Full name" optional>
              <AdminInput value={form.name} onChange={(e) => set('name', e.target.value)} />
            </AdminFormField>
            <AdminFormField label={editing ? 'New password' : 'Password'} optional={editing}>
              <AdminInput
                type="password"
                value={form.password}
                autoComplete="new-password"
                placeholder={editing ? 'Leave blank to keep the current one' : 'At least 10 characters'}
                onChange={(e) => set('password', e.target.value)}
              />
            </AdminFormField>
          </div>

          <fieldset className="mt-8">
            <legend className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">Role</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer gap-3 border px-4 py-3 ${
                    form.role === r.value ? 'border-gold bg-gold/8' : 'border-ivory/15'
                  } ${isSelf ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    className="mt-1 accent-gold"
                    checked={form.role === r.value}
                    disabled={isSelf}
                    onChange={() => set('role', r.value)}
                  />
                  <span>
                    <span className="block text-[15px] text-ivory">{r.label}</span>
                    <span className="block text-[13px] text-ivory/60">{r.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {isSelf && <p className="mt-2 text-[13px] text-ivory/55">You cannot change your own role.</p>}
          </fieldset>

          {form.role === 'STAFF' && (
            <fieldset className="mt-8">
              <legend className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                Sections they can use
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {PERMISSIONS.map((p) => (
                  <label key={p.key} className="flex cursor-pointer gap-3 border border-ivory/12 px-4 py-3 hover:border-ivory/30">
                    <input
                      type="checkbox"
                      className="mt-1 accent-gold"
                      checked={form.permissions.includes(p.key)}
                      onChange={() => togglePermission(p.key)}
                    />
                    <span>
                      <span className="block text-[14px] text-ivory">{p.label}</span>
                      <span className="block text-[12px] text-ivory/55">{p.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {editing && !isSelf && (
            <div className="mt-8">
              <AdminToggle
                checked={form.active}
                onChange={(v) => set('active', v)}
                label="Account active"
                description="Turn off to block sign-in without deleting the account. Takes effect immediately."
              />
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ivory/12 pt-6">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="inline-flex items-center gap-2 bg-gold px-6 py-3 font-semibold text-night disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Save changes' : 'Create user'}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="border border-ivory/25 px-6 py-3 text-ivory hover:border-gold"
            >
              Cancel
            </button>
            {editing && !isSelf && (
              <button type="button" onClick={remove} disabled={busy} className="ml-auto px-2 py-3 text-[14px] text-danger underline">
                Delete user
              </button>
            )}
          </div>
        </AdminSectionCard>
      )}

      <div className="overflow-x-auto border border-ivory/12 bg-ink">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-ivory/12 text-[10px] uppercase tracking-[0.2em] text-gold">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Access</th>
              <th className="px-5 py-3 font-semibold">Last sign-in</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory/8">
            {users.map((u) => (
              <tr key={u.id} className={u.active ? '' : 'opacity-55'}>
                <td className="px-5 py-4 align-top">
                  <p className="text-ivory">
                    {u.name || u.username}
                    {u.id === currentUserId && <span className="ml-2 text-[12px] text-ivory/50">(you)</span>}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ivory/55">
                    {u.username} · {u.email}
                  </p>
                </td>
                <td className="px-5 py-4 align-top">
                  <p className={u.role === 'SUPER_ADMIN' ? 'text-gold' : 'text-ivory'}>
                    {u.role === 'SUPER_ADMIN' ? 'Super admin' : 'Staff'}
                    {!u.active && <span className="ml-2 text-danger">Disabled</span>}
                  </p>
                  <p className="mt-0.5 max-w-[340px] text-[12px] text-ivory/55">{accessSummary(u)}</p>
                </td>
                <td className="px-5 py-4 align-top text-[13px] text-ivory/60">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-NG') : 'Never'}
                </td>
                <td className="px-5 py-4 text-right align-top">
                  <button
                    type="button"
                    onClick={() => setForm(toForm(u))}
                    className="text-[13px] text-gold underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
