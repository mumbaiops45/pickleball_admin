"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { FormError } from "@/components/ui/DataState";
import { PasswordInput, Select, TextInput } from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomers";

/**
 * Create and edit an account, against `POST /auth/register` and
 * `PUT /auth/users/:id`.
 *
 * The two modes differ in more than the verb:
 *
 * - A password can only be *set*, never changed. `register` requires one and
 *   no route updates it, so the field appears on create and is absent on edit
 *   rather than sitting there doing nothing.
 * - Blocking is a state an existing account is in, so it belongs on the edit
 *   form only — a brand new account is never created blocked.
 *
 * E-mail and phone are both optional individually, but the API needs at least
 * one of them: it is how the account signs in. That rule is checked here so
 * the operator sees it against the fields rather than as a 400.
 */
export default function CustomerForm({ customer, isSelf, onClose, onSaved }) {
  const editing = Boolean(customer);

  const [form, setForm] = useState(() => ({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    password: "",
    role: customer?.role ?? "CUSTOMER",
    isBlocked: customer?.isBlocked ?? false,
  }));

  const [touched, setTouched] = useState(false);

  const create = useCreateCustomer();
  const update = useUpdateCustomer();

  const busy = create.loading || update.loading;
  const error = create.error ?? update.error;

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const contactMissing = !form.email.trim() && !form.phone.trim();
  const passwordMissing = !editing && form.password.length < 6;

  const onSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);

    if (contactMissing || passwordMissing) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
    };

    const saved = editing
      ? await update.mutate(customer._id, {
          ...payload,
          // Nothing on the server stops an admin demoting themselves — it
          // would simply lock them out of this panel on the next sign-in — so
          // the field is disabled and the key is left off the request.
          ...(isSelf ? { role: undefined } : null),
          isBlocked: form.isBlocked,
        })
      : await create.mutate({ ...payload, password: form.password });

    if (saved) onSaved();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? `Edit ${customer.name || "account"}` : "New account"}
      description={
        editing
          ? "PUT /api/auth/users/:id"
          : "POST /api/auth/register — the e-mail and phone are both unique."
      }
      footer={
        <>
          <Button tone="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" tone="primary" loading={busy}>
            {editing ? "Save changes" : "Create account"}
          </Button>
        </>
      }
    >
      <form
        id="customer-form"
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <TextInput
          label="Name"
          value={form.name}
          onChange={set("name")}
          placeholder="Priya Sharma"
          autoComplete="off"
        />

        <TextInput
          label="E-mail"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="priya@example.com"
          autoComplete="off"
          error={
            touched && contactMissing ? "An e-mail or a phone is required." : undefined
          }
        />

        <TextInput
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          placeholder="9876543210"
          autoComplete="off"
          hint="Either contact will do — both are unique across accounts."
        />

        {editing ? null : (
          <PasswordInput
            label="Password"
            required
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
            hint="Set once here; there is no route to change it later."
            error={
              touched && passwordMissing
                ? "At least six characters."
                : undefined
            }
          />
        )}

        <Select
          label="Role"
          value={form.role}
          onChange={set("role")}
          disabled={isSelf}
          hint={
            isSelf
              ? "You cannot change your own role."
              : form.role === "ADMIN"
                ? "Admins can sign in here and edit the whole catalogue."
                : undefined
          }
        >
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </Select>

        {editing ? (
          <label className="flex items-start gap-3 rounded-lg border border-line bg-surface p-3.5">
            <input
              type="checkbox"
              checked={form.isBlocked}
              disabled={isSelf}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isBlocked: event.target.checked,
                }))
              }
              className="mt-0.5 size-4 accent-volt-deep"
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-[13.5px] font-medium text-ink">Blocked</span>
              <span className="text-[12.5px] text-mist">
                {isSelf
                  ? "You cannot block yourself."
                  : "Their token is refused on the next request; the account stays intact."}
              </span>
            </span>
          </label>
        ) : null}

        <FormError error={error} />
      </form>
    </Modal>
  );
}
