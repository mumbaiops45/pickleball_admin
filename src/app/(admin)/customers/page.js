"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataState, { FormError } from "@/components/ui/DataState";
import { Select, TextInput } from "@/components/ui/Field";
import {
  EditIcon,
  LockIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
  TrashIcon,
} from "@/components/ui/Icons";
import Modal from "@/components/ui/Modal";
import CustomerForm from "@/components/customers/CustomerForm";
import PageHeader from "@/components/ui/PageHeader";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import {
  useBlockCustomer,
  useCustomers,
  useDeleteCustomer,
  useSetCustomerRole,
} from "@/hooks/useCustomers";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/store/AuthProvider";

/**
 * Accounts and access, against `/api/auth/users`.
 *
 * Blocking is the reversible lever and it is the one surfaced inline —
 * `authMiddleware` already refuses a blocked user's token, so the effect is
 * immediate. Deleting and promoting both go through a confirmation because
 * neither can be undone from here.
 */
export default function CustomersPage() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [state, setState] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);
  const [editing, setEditing] = useState(undefined); // undefined = closed

  const { filtered, customers, loading, error, refetch } = useCustomers({
    search,
    role,
    state,
  });

  const block = useBlockCustomer();
  const setUserRole = useSetCustomerRole();
  const remove = useDeleteCustomer();

  // The row that is mid-request, so only its own button shows a spinner.
  const [busyId, setBusyId] = useState(null);

  const toggleBlock = async (customer) => {
    setBusyId(customer._id);
    const result = await block.mutate(customer._id, !customer.isBlocked);
    setBusyId(null);
    if (result) refetch();
  };

  // Optional chaining on both of these is load-bearing, not defensive: the
  // React Compiler lifts each property path into the memo dependency check
  // for its callback, which runs on every render — and both start as null.
  const confirmRole = async () => {
    const next = pendingRole?.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    const result = await setUserRole.mutate(pendingRole?._id, next);
    if (result === null) return;

    setPendingRole(null);
    refetch();
  };

  const confirmDelete = async () => {
    const result = await remove.mutate(pendingDelete?._id);
    if (result === null) return;

    setPendingDelete(null);
    refetch();
  };

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Commerce"
        title="Customers"
        copy="Every registered account. Blocking takes effect on the account's next request."
        action={
          <>
            <Button tone="outline" icon={RefreshIcon} onClick={refetch}>
              Refresh
            </Button>
            <Button icon={PlusIcon} onClick={() => setEditing(null)}>
              New account
            </Button>
          </>
        }
      />

      <FormError error={block.error ?? setUserRole.error} />

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-end">
          <div className="relative flex-1">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-[2.85rem] size-4 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <TextInput
              label="Search"
              type="search"
              placeholder="Name, e-mail or phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            label="Role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="md:w-44"
          >
            <option value="">All roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </Select>

          <Select
            label="Access"
            value={state}
            onChange={(event) => setState(event.target.value)}
            className="md:w-44"
          >
            <option value="">Any state</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
          </Select>
        </div>

        <div className="p-5">
          <DataState
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filtered.length === 0}
            emptyTitle={
              customers.length === 0
                ? "No accounts yet"
                : "Nothing matches those filters"
            }
            emptyBody={
              customers.length === 0
                ? "Accounts appear here as soon as someone registers on the storefront."
                : "Clear the search or pick a different role."
            }
            emptyAction={
              customers.length === 0 ? (
                <Button
                  tone="outline"
                  size="sm"
                  icon={PlusIcon}
                  onClick={() => setEditing(null)}
                >
                  New account
                </Button>
              ) : null
            }
            rows={6}
          >
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>Customer</Th>
                    <Th>Contact</Th>
                    <Th>Role</Th>
                    <Th>Access</Th>
                    <Th>Last login</Th>
                    <Th align="right">
                      <span className="sr-only">Actions</span>
                    </Th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((customer) => {
                    const isMe = customer._id === me?.id;
                    const busy = busyId === customer._id;

                    return (
                      <Tr key={customer._id}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <Avatar user={customer} size="sm" />
                            <div className="flex flex-col">
                              <span className="font-medium text-ink">
                                {customer.name || "Unnamed"}
                              </span>
                              {isMe ? (
                                <span className="text-[11.5px] text-mist">
                                  That&apos;s you
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </Td>

                        <Td className="text-mist">
                          <div className="flex flex-col">
                            {customer.email ? <span>{customer.email}</span> : null}
                            {customer.phone ? (
                              <span className="text-[12.5px]">
                                {customer.phone}
                              </span>
                            ) : null}
                            {!customer.email && !customer.phone ? "—" : null}
                          </div>
                        </Td>

                        <Td>
                          <Badge
                            tone={customer.role === "ADMIN" ? "accent" : "neutral"}
                          >
                            {customer.role}
                          </Badge>
                        </Td>

                        <Td>
                          <Badge tone={customer.isBlocked ? "bad" : "good"} dot>
                            {customer.isBlocked ? "Blocked" : "Active"}
                          </Badge>
                        </Td>

                        <Td className="tnum whitespace-nowrap text-mist">
                          {formatDate(customer.lastLoginAt)}
                        </Td>

                        <Td align="right">
                          <div className="flex justify-end gap-1">
                            <Button
                              tone="ghost"
                              size="sm"
                              icon={EditIcon}
                              title="Edit"
                              aria-label={`Edit ${customer.name || "this account"}`}
                              onClick={() => setEditing(customer)}
                            />
                            <Button
                              tone="ghost"
                              size="sm"
                              icon={ShieldIcon}
                              disabled={isMe}
                              title={
                                isMe
                                  ? "You cannot change your own role"
                                  : `Make ${customer.role === "ADMIN" ? "a customer" : "an admin"}`
                              }
                              aria-label={`Change the role of ${customer.name || "this account"}`}
                              onClick={() => {
                                setUserRole.reset();
                                setPendingRole(customer);
                              }}
                            />
                            <Button
                              tone="ghost"
                              size="sm"
                              icon={LockIcon}
                              loading={busy}
                              disabled={isMe}
                              title={
                                isMe
                                  ? "You cannot block yourself"
                                  : customer.isBlocked
                                    ? "Unblock"
                                    : "Block"
                              }
                              aria-label={`${customer.isBlocked ? "Unblock" : "Block"} ${customer.name || "this account"}`}
                              onClick={() => toggleBlock(customer)}
                            />
                            <Button
                              tone="ghost"
                              size="sm"
                              icon={TrashIcon}
                              disabled={isMe}
                              title={
                                isMe ? "You cannot delete your own account" : "Delete"
                              }
                              aria-label={`Delete ${customer.name || "this account"}`}
                              onClick={() => {
                                remove.reset();
                                setPendingDelete(customer);
                              }}
                            />
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>

              <p className="pt-4 text-[12.5px] text-mist">
                Showing {filtered.length} of {customers.length} accounts.
              </p>
            </>
          </DataState>
        </div>
      </Card>

      {/* Mounted only while open, so each visit starts from clean state. */}
      {editing !== undefined ? (
        <CustomerForm
          customer={editing}
          isSelf={Boolean(editing && editing._id === me?.id)}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            refetch();
          }}
        />
      ) : null}

      <Modal
        open={Boolean(pendingRole)}
        onClose={() => setPendingRole(null)}
        title={
          pendingRole?.role === "ADMIN"
            ? "Remove admin access?"
            : "Grant admin access?"
        }
        description="PUT /api/auth/users/:id"
        footer={
          <>
            <Button tone="outline" onClick={() => setPendingRole(null)}>
              Cancel
            </Button>
            <Button
              tone={pendingRole?.role === "ADMIN" ? "danger" : "primary"}
              icon={ShieldIcon}
              loading={setUserRole.loading}
              onClick={confirmRole}
            >
              {pendingRole?.role === "ADMIN" ? "Make customer" : "Make admin"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-mist">
            {pendingRole?.role === "ADMIN" ? (
              <>
                <strong className="font-medium text-ink">
                  {pendingRole?.name || pendingRole?.email}
                </strong>{" "}
                will lose access to this panel on their next sign-in.
              </>
            ) : (
              <>
                <strong className="font-medium text-ink">
                  {pendingRole?.name || pendingRole?.email}
                </strong>{" "}
                will be able to sign in here and edit the whole catalogue.
              </>
            )}
          </p>
          <FormError error={setUserRole.error} />
        </div>
      </Modal>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete this account?"
        description="The account is removed outright — their orders keep a reference that no longer resolves."
        footer={
          <>
            <Button tone="outline" onClick={() => setPendingDelete(null)}>
              Keep it
            </Button>
            <Button
              tone="danger"
              icon={TrashIcon}
              loading={remove.loading}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-mist">
            <strong className="font-medium text-ink">
              {pendingDelete?.name || pendingDelete?.email || "This account"}
            </strong>{" "}
            will be gone for good. Blocking is the reversible alternative.
          </p>
          <FormError error={remove.error} />
        </div>
      </Modal>
    </div>
  );
}
