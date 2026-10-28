interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export default function AdminSelect({ options, className = '', ...props }: AdminSelectProps) {
  return (
    <select
      {...props}
      className={`w-full rounded-[12px] border border-[rgba(247,241,227,0.16)] bg-[#11142F] px-4 py-3 text-sm text-[#F7F1E3] transition-colors focus:border-[#E3B23C] focus:outline-none ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
