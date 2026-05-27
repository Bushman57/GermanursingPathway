import type { FieldOption } from "@/lib/scholarshipFieldOptions";

type Props = {
  options: FieldOption[];
  value: string[];
  onChange: (value: string[]) => void;
};

export function AdminCheckboxGroup({ options, value, onChange }: Props) {
  const toggle = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  };

  return (
    <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg bg-muted/20">
      {options.map((o) => (
        <label key={o.value} className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={value.includes(o.value)}
            onChange={() => toggle(o.value)}
            className="mt-0.5 rounded text-warm focus:ring-warm"
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
