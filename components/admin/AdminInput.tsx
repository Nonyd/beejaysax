interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function AdminInput({ className = '', ...props }: AdminInputProps) {
  return (
    <input
      {...props}
      className={`w-full border border-[#2A2A2A] bg-[#161616] px-4 py-2.5 text-sm text-white transition-colors placeholder:text-[#333] focus:border-[#C9A84C] focus:outline-none ${className}`}
    />
  )
}
