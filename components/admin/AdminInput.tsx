interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function AdminInput({ className = '', ...props }: AdminInputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-[12px] border border-ivory/16 bg-night px-4 py-3 text-sm text-ivory transition-colors placeholder:text-ivory/45 focus:border-gold focus:outline-none ${className}`}
    />
  )
}
