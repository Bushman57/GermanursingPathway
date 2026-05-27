import { Input } from "@/components/ui/input";

export function FormField({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </label>
  );
}

export function TextInput(props: React.ComponentProps<typeof Input>) {
  return <Input className="w-full" {...props} />;
}

export function TextArea({
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-warm/30"
      {...props}
    />
  );
}

export function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function listToLines(items: string[] | undefined): string {
  return (items ?? []).join("\n");
}
