export default function Placeholder({ title = 'Coming Soon', subtitle = 'Content will appear here.' }) {
  return (
    <div className="border border-dashed rounded-lg p-6 text-center text-slate-500">
      <div className="font-medium text-slate-700">{title}</div>
      <div className="text-sm">{subtitle}</div>
    </div>
  )
}
