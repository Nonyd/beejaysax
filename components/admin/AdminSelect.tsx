interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export default function AdminSelect({ options, className = '', ...props }: AdminSelectProps) {
  return (
    <select
      {...props}
      className={`w-full border border-[#1E1E1E] bg-[#0F0F0F] px-4 py-3 text-sm text-[#F5F0E8] transition-colors focus:border-[#C9A84C] focus:outline-none ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
