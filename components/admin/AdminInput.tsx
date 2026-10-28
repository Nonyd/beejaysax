interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function AdminInput({ className = '', ...props }: AdminInputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-[12px] border border-[rgba(247,241,227,0.16)] bg-[#11142F] px-4 py-3 text-sm text-[#F7F1E3] transition-colors placeholder:text-[rgba(247,241,227,0.45)] focus:border-[#E3B23C] focus:outline-none ${className}`}
    />
  )
}
