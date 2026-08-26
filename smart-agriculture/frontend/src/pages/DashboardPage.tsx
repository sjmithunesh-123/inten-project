import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { api } from '../api/client'
import { StatsCard } from '../components/StatsCard'
import type { ApiEnvelope, DashboardAnalytics, DashboardSummary } from '../types'
import { agricultureImages, imageFallback } from '../assets/images'

const fallbackSummary: DashboardSummary = {
  total_users: 1,
  active_users: 1,
  total_predictions: 6,
  disease_predictions: 3,
  crop_recommendations: 2,
}

const fallbackAnalytics: DashboardAnalytics = {
  disease_distribution: [
    { label: 'Tomato blight', value: 3 },
    { label: 'Leaf spot', value: 2 },
    { label: 'Powdery mildew', value: 1 },
  ],
  crop_distribution: [
    { label: 'Rice', value: 2 },
    { label: 'Maize', value: 2 },
    { label: 'Wheat', value: 1 },
  ],
  monthly_predictions: [
    { month: 'Jan', count: 1 },
    { month: 'Feb', count: 1 },
    { month: 'Mar', count: 2 },
    { month: 'Apr', count: 2 },
  ],
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(fallbackSummary)
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(fallbackAnalytics)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryRes, analyticsRes] = await Promise.all([
          api.get<ApiEnvelope<DashboardSummary>>('/dashboard/summary').catch((error) => {
            if (error?.response?.status === 401) {
              return { data: { data: fallbackSummary } } as { data: { data: DashboardSummary } }
            }
            throw error
          }),
          api.get<ApiEnvelope<DashboardAnalytics>>('/dashboard/analytics').catch((error) => {
            if (error?.response?.status === 401) {
              return { data: { data: fallbackAnalytics } } as { data: { data: DashboardAnalytics } }
            }
            throw error
          }),
        ])

        setSummary(summaryRes.data.data)
        setAnalytics(analyticsRes.data.data)
      } catch (error) {
        console.warn('Using local dashboard fallback data for demo mode.', error)
        setSummary(fallbackSummary)
        setAnalytics(fallbackAnalytics)
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  const chartData = summary
    ? [
        { name: 'Users', value: summary.total_users },
        { name: 'Active', value: summary.active_users },
        { name: 'Predictions', value: summary.total_predictions },
      ]
    : []

  const diseaseChartData = analytics?.disease_distribution ?? []
  const cropChartData = analytics?.crop_distribution ?? []
  const monthlyChartData = analytics?.monthly_predictions ?? []

  if (loading) return <div className="panel loading-panel">Loading dashboard…</div>

  return (
    <div className="dashboard-page">
      <section className="page-banner dashboard-banner"><div><p className="eyebrow">FIELD COMMAND CENTER</p><h2>Good morning, farmer.</h2><p>Here is the pulse of your growing operation today.</p></div><img src={agricultureImages.dashboard} alt="Aerial view of cultivated farm fields" onError={(event) => { event.currentTarget.src = imageFallback }} /><span className="banner-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span></section>
      <section className="stats-grid">
        <StatsCard label="Total users" value={summary?.total_users ?? 0} detail="Registered farmers and admins" />
        <StatsCard label="Active users" value={summary?.active_users ?? 0} detail="Currently enabled accounts" />
        <StatsCard label="Total predictions" value={summary?.total_predictions ?? 0} detail="Across disease and crop analysis" />
        <StatsCard label="Crop picks" value={summary?.crop_recommendations ?? 0} detail="Recommendations served" />
      </section>

      <section className="panel chart-panel">
        <div className="panel-header">
          <h3>Operational overview</h3>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e1d5" />
              <XAxis dataKey="name" stroke="#3c4a3d" />
              <YAxis stroke="#3c4a3d" />
              <Tooltip />
              <Bar dataKey="value" fill="#2f7d32" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel-grid two-col">
        <div className="panel">
          <div className="panel-header">
            <h3>Disease distribution</h3>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={diseaseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7e1d5" />
                <XAxis dataKey="label" stroke="#3c4a3d" />
                <YAxis stroke="#3c4a3d" />
                <Tooltip />
                <Bar dataKey="value" fill="#1c7c54" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Monthly prediction trend</h3>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7e1d5" />
                <XAxis dataKey="month" stroke="#3c4a3d" />
                <YAxis stroke="#3c4a3d" />
                <Tooltip />
                <Bar dataKey="count" fill="#89b93c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Recommended crop mix</h3>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cropChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e1d5" />
              <XAxis dataKey="label" stroke="#3c4a3d" />
              <YAxis stroke="#3c4a3d" />
              <Tooltip />
              <Bar dataKey="value" fill="#4e7b2d" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
