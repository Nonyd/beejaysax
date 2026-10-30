interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export default function AdminSelect({ options, className = '', ...props }: AdminSelectProps) {
  return (
    <select
      {...props}
      className={`w-full rounded-[12px] border border-ivory/16 bg-night px-4 py-3 text-sm text-ivory transition-colors focus:border-gold focus:outline-none ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
