import type { FieldOption } from "@/lib/scholarshipFieldOptions";

const selectClass =
  "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-warm/30";

type Props = {
  options: FieldOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowEmpty?: boolean;
};

export function AdminSelect({ options, value, onChange, placeholder, allowEmpty }: Props) {
  return (
    <select
      className={selectClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {allowEmpty && <option value="">{placeholder ?? "Select…"}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
