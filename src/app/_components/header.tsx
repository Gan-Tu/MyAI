interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="flex items-center p-6 border-b border-gray-200 min-w-[140px]">
      <div className="space-y-2">
        {title ? (
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        ) : (
          <div className="min-h-6 w-[160px] animate-pulse bg-slate-200 rounded col-span-2"></div>
        )}
        {subtitle ? (
          <p className="text-sm text-gray-600">{subtitle}</p>
        ) : (
          <div className="min-h-6 w-[120px] animate-pulse bg-slate-200 rounded col-span-2"></div>
        )}
      </div>
    </div>
  );
}
