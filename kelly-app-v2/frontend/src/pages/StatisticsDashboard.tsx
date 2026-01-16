import React, { useState, useEffect } from 'react'
import { getStatistics, createStatisticsBackup, type StatisticsData } from '../services/api'

type PeriodType = 'day' | 'week' | 'month' | 'year' | 'all'

function StatisticsDashboard() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<PeriodType>('all')
  const [backupLoading, setBackupLoading] = useState(false)

  useEffect(() => {
    loadStatistics()
  }, [period])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getStatistics(period)
      setStatistics(data)
    } catch (err: any) {
      console.error('Error loading statistics:', err)
      setError(err.message || 'Error loading statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    try {
      setBackupLoading(true)
      const result = await createStatisticsBackup()
      alert(`Backup created successfully!\nFile: ${result.backup_file}\nTimestamp: ${result.timestamp}`)
    } catch (err: any) {
      console.error('Error creating backup:', err)
      alert('Error creating backup: ' + (err.message || 'Unknown error'))
    } finally {
      setBackupLoading(false)
    }
  }

  const formatTime = (minutes: number | null): string => {
    if (minutes === null || minutes === 0) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getHeatmapColor = (value: number, max: number): string => {
    if (value === 0) return '#ebedf0'
    const intensity = Math.min(value / max, 1)
    if (intensity < 0.2) return '#c6e48b'
    if (intensity < 0.4) return '#7bc96f'
    if (intensity < 0.6) return '#239a3b'
    if (intensity < 0.8) return '#196127'
    return '#0e4429'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!statistics) {
    return null
  }

  const maxHeatmapValue = Math.max(...statistics.heatmap_data.map(d => d.value), 1)

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📊 Statistics Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive analytics for all visit types</p>
            </div>
            <div className="flex gap-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodType)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={handleBackup}
                disabled={backupLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {backupLoading ? 'Creating...' : '💾 Create Backup'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600">{statistics.total_info_sessions}</div>
            <div className="text-gray-600 mt-1">Info Sessions</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600">{statistics.total_new_hire_orientations}</div>
            <div className="text-gray-600 mt-1">New Hire Orientations</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-purple-600">{statistics.total_visits}</div>
            <div className="text-gray-600 mt-1">Team Visits</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-yellow-600">{statistics.total_badges}</div>
            <div className="text-gray-600 mt-1">Badges</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-orange-600">{statistics.total_fingerprints}</div>
            <div className="text-gray-600 mt-1">Fingerprints</div>
          </div>
        </div>

        {/* Average Completion Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">⏱️ Average Completion Times</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Info Sessions:</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatTime(statistics.average_completion_time_info_sessions)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">New Hire Orientations:</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatTime(statistics.average_completion_time_new_hire)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📅 Time Slot Distribution</h2>
            <div className="space-y-2">
              {Object.entries(statistics.time_slot_distribution).map(([slot, count]) => (
                <div key={slot} className="flex justify-between items-center">
                  <span className="text-gray-700">{slot}:</span>
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Distributions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📊 Info Sessions by Status</h2>
            <div className="space-y-2">
              {Object.entries(statistics.info_sessions_by_status).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{status}:</span>
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📊 New Hire Orientations by Status</h2>
            <div className="space-y-2">
              {Object.entries(statistics.new_hire_orientations_by_status).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{status}:</span>
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📊 Visits by Status</h2>
            <div className="space-y-2">
              {Object.entries(statistics.visits_by_status).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{status}:</span>
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Calendar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🔥 Activity Heatmap</h2>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid grid-cols-7 gap-1" style={{ gridTemplateColumns: 'repeat(53, minmax(12px, 1fr))' }}>
                {statistics.heatmap_data.slice(-365).map((day, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: getHeatmapColor(day.value, maxHeatmapValue) }}
                    title={`${formatDate(day.date)}: ${day.value} total activities`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ebedf0' }}></div>
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#c6e48b' }}></div>
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#7bc96f' }}></div>
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#239a3b' }}></div>
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#196127' }}></div>
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#0e4429' }}></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Daily Stats Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📈 Daily Activity</h2>
          <div className="h-64 overflow-x-auto">
            <div className="flex items-end gap-2 h-full">
              {statistics.daily_stats.slice(-30).map((day, index) => {
                const maxValue = Math.max(...statistics.daily_stats.slice(-30).map(d => d.total), 1)
                const height = (day.total / maxValue) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${formatDate(day.date)}\nTotal: ${day.total}\nInfo Sessions: ${day.info_sessions}\nNew Hire: ${day.new_hire_orientations}\nVisits: ${day.visits}\nBadges: ${day.badges}\nFingerprints: ${day.fingerprints}`}
                    />
                    <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap opacity-0 group-hover:opacity-100">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📅 Weekly Statistics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">Week</th>
                  <th className="px-4 py-2 text-right">Info Sessions</th>
                  <th className="px-4 py-2 text-right">New Hire</th>
                  <th className="px-4 py-2 text-right">Visits</th>
                  <th className="px-4 py-2 text-right">Badges</th>
                  <th className="px-4 py-2 text-right">Fingerprints</th>
                  <th className="px-4 py-2 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {statistics.weekly_stats.slice(-12).reverse().map((week, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {formatDate(week.week_start)} - {formatDate(week.week_end)}
                    </td>
                    <td className="px-4 py-2 text-right">{week.info_sessions}</td>
                    <td className="px-4 py-2 text-right">{week.new_hire_orientations}</td>
                    <td className="px-4 py-2 text-right">{week.visits}</td>
                    <td className="px-4 py-2 text-right">{week.badges}</td>
                    <td className="px-4 py-2 text-right">{week.fingerprints}</td>
                    <td className="px-4 py-2 text-right font-bold">{week.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📆 Monthly Statistics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-right">Info Sessions</th>
                  <th className="px-4 py-2 text-right">New Hire</th>
                  <th className="px-4 py-2 text-right">Visits</th>
                  <th className="px-4 py-2 text-right">Badges</th>
                  <th className="px-4 py-2 text-right">Fingerprints</th>
                  <th className="px-4 py-2 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {statistics.monthly_stats.slice(-12).reverse().map((month, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">{month.month}</td>
                    <td className="px-4 py-2 text-right">{month.info_sessions}</td>
                    <td className="px-4 py-2 text-right">{month.new_hire_orientations}</td>
                    <td className="px-4 py-2 text-right">{month.visits}</td>
                    <td className="px-4 py-2 text-right">{month.badges}</td>
                    <td className="px-4 py-2 text-right">{month.fingerprints}</td>
                    <td className="px-4 py-2 text-right font-bold">{month.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recruiter Performance */}
        {statistics.recruiter_performance.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">👥 Recruiter Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left">Recruiter</th>
                    <th className="px-4 py-2 text-right">Assigned</th>
                    <th className="px-4 py-2 text-right">Completed</th>
                    <th className="px-4 py-2 text-right">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.recruiter_performance.map((recruiter, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-semibold">{recruiter.recruiter_name}</td>
                      <td className="px-4 py-2 text-right">{recruiter.assigned_sessions}</td>
                      <td className="px-4 py-2 text-right">{recruiter.completed_sessions}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`font-semibold ${
                          recruiter.completion_rate >= 80 ? 'text-green-600' :
                          recruiter.completion_rate >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {recruiter.completion_rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatisticsDashboard
