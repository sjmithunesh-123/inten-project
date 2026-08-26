type StatsCardProps = {
  label: string
  value: string | number
  detail: string
}

export function StatsCard({ label, value, detail }: StatsCardProps) {
  return (
    <div className="stats-card">
      <p>{label}</p>
      <h3>{value}</h3>
      <span>{detail}</span>
    </div>
  )
}
