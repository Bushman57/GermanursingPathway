import { useState } from "react";
import { CommandMenu } from "@/components/search/CommandMenu";

export function GlobalShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {children}
      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
      <button
        type="button"
        className="sr-only"
        id="gnp-open-command"
        onClick={() => setSearchOpen(true)}
      />
    </>
  );
}

export function openCommandMenu() {
  document.getElementById("gnp-open-command")?.click();
}
