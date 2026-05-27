import type { FieldOption } from "@/lib/scholarshipFieldOptions";

type Props = {
  options: FieldOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
};

export function AdminRadioGroup({ options, value, onChange, name }: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="text-warm focus:ring-warm"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}
