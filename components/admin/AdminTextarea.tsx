interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function AdminTextarea({ className = '', ...props }: AdminTextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-[12px] border border-ivory/16 bg-night px-4 py-3 text-sm text-ivory transition-colors placeholder:text-ivory/45 focus:border-gold focus:outline-none ${className}`}
    />
  )
}
