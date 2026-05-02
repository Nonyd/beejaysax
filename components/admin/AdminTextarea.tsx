interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function AdminTextarea({ className = '', ...props }: AdminTextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none border border-[#1E1E1E] bg-[#0F0F0F] px-4 py-3 text-sm text-[#F5F0E8] transition-colors placeholder:text-[#444] focus:border-[#C9A84C] focus:outline-none ${className}`}
    />
  )
}
