"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { FormError } from "@/components/ui/DataState";
import { PasswordInput, TextInput } from "@/components/ui/Field";
import { ShieldIcon } from "@/components/ui/Icons";
import { useApiMutation } from "@/hooks/useApi";
import { useAuth } from "@/store/AuthProvider";

/**
 * The seeded administrator. Prefilled so the panel can be opened on a fresh
 * checkout without hunting for credentials — swap or drop this once real
 * accounts exist.
 */
const DEMO = { identifier: "admin@gmail.com", password: "123456" };

/**
 * Credentials form.
 *
 * The API accepts either an e-mail or a phone number, so the field asks for
 * one "identifier" and `auth.service` picks the key. `useApiMutation` catches
 * the failure, which is why there is no try/catch here — including the
 * "not an administrator" rejection <AuthProvider> raises for CUSTOMER logins.
 */
export default function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState(DEMO.identifier);
  const [password, setPassword] = useState(DEMO.password);

  const { mutate, loading, error } = useApiMutation(signIn);

  const onSubmit = async (event) => {
    event.preventDefault();

    const user = await mutate({ identifier, password });
    if (user) router.replace("/dashboard");
  };

  const fillDemo = () => {
    setIdentifier(DEMO.identifier);
    setPassword(DEMO.password);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <TextInput
        label="E-mail or phone"
        name="identifier"
        type="text"
        autoComplete="username"
        placeholder="admin@paddlehaus.in"
        required
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        hint="Whichever the account was registered with."
      />

      <PasswordInput
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <DemoHint onUse={fillDemo} />

      <FormError error={error} />

      <Button
        type="submit"
        tone="primary"
        size="lg"
        loading={loading}
        icon={ShieldIcon}
        className="mt-1 w-full"
        disabled={!identifier.trim() || !password}
      >
        {loading ? "Signing in…" : "Sign in to the panel"}
      </Button>

      <p className="text-center text-[12.5px] leading-relaxed text-mist">
        Only accounts with the <strong className="font-medium text-ink">ADMIN</strong>{" "}
        role can open the panel.
      </p>
    </form>
  );
}

/** Shows the demo account and puts it back if the fields were edited. */
function DemoHint({ onUse }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg border border-line bg-surface px-3 py-2.5">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-faint">
          Demo account
        </span>
        <span className="font-mono text-[11.5px] leading-none text-mist">
          {DEMO.identifier} · {DEMO.password}
        </span>
      </div>

      <button
        type="button"
        onClick={onUse}
        className="rounded-md border border-line-strong px-2.5 py-1 text-[11.5px] font-medium text-ink transition-colors hover:bg-surface-2"
      >
        Use
      </button>
    </div>
  );
}
