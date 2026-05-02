interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export default function AdminSelect({ options, className = '', ...props }: AdminSelectProps) {
  return (
    <select
      {...props}
      className={`w-full border border-[#2A2A2A] bg-[#161616] px-4 py-2.5 text-sm text-white transition-colors focus:border-[#C9A84C] focus:outline-none ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
