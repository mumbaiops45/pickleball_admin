"use client";

import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { LogOutIcon, ShieldIcon } from "@/components/ui/Icons";
import { useAuth } from "@/store/AuthProvider";


export default function SettingsPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-7">
      <header className="flex flex-col items-center text-center">
        <h1 className="text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          Settings
        </h1>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-mist">
          The account this panel is signed in as.
        </p>
      </header>

      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <Avatar user={user} size="lg" />

          <p className="break-anywhere mt-4 text-[15px] font-semibold text-ink">
            {user?.name?.trim() || "Unnamed administrator"}
          </p>

          {user?.email ? (
            <p className="break-anywhere mt-1 max-w-full text-[13px] text-mist">
              {user.email}
            </p>
          ) : null}

          {user?.phone ? (
            <p className="mt-0.5 text-[13px] text-mist">{user.phone}</p>
          ) : null}

          <Badge tone="accent" className="mt-3">
            <ShieldIcon className="size-3" aria-hidden="true" />
            {user?.role ?? "UNKNOWN"}
          </Badge>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 border-t border-line pt-5">
          <Button
            tone="outline"
            icon={LogOutIcon}
            className="w-full"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
          <p className="text-[12.5px] text-mist">
            Clears the session on this device.
          </p>
        </div>
      </Card>
    </div>
  );
}
