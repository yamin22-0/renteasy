export default function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-[#0B0B0C] z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
