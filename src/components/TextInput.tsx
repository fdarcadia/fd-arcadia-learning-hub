type TextInputProps = {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
};

export function TextInput({
  label,
  type = "text",
  value,
  placeholder,
  required,
  onChange,
}: TextInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-emerald-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-lg text-indigo-700 outline-none transition placeholder:text-indigo-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </label>
  );
}
