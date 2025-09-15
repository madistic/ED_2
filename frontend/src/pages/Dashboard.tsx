import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Users,
  Building2
} from 'lucide-react'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import api from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface DashboardStats {
  totalTransactions: number
  totalAmount: number
  successfulTransactions: number
  pendingTransactions: number
  failedTransactions: number
  recentTransactions: any[]
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalAmount: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    recentTransactions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/transactions?limit=100')
      const transactions = response.data.data

      const totalTransactions = transactions.length
      const totalAmount = transactions.reduce((sum: number, t: any) => sum + t.transaction_amount, 0)
      const successfulTransactions = transactions.filter((t: any) => t.status === 'success').length
      const pendingTransactions = transactions.filter((t: any) => t.status === 'pending').length
      const failedTransactions = transactions.filter((t: any) => t.status === 'failed').length
      const recentTransactions = transactions.slice(0, 5)

      setStats({
        totalTransactions,
        totalAmount,
        successfulTransactions,
        pendingTransactions,
        failedTransactions,
        recentTransactions
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusChartData = {
    labels: ['Success', 'Pending', 'Failed'],
    datasets: [
      {
        data: [stats.successfulTransactions, stats.pendingTransactions, stats.failedTransactions],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  }

  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Transactions',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color === 'text-green-600' ? 'bg-green-100' : 
                                        color === 'text-blue-600' ? 'bg-blue-100' : 
                                        color === 'text-yellow-600' ? 'bg-yellow-100' : 'bg-red-100'}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor your school payment transactions and analytics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          icon={CreditCard}
          color="text-blue-600"
          subtitle="All time"
        />
        <StatCard
          title="Total Amount"
          value={`₹${stats.totalAmount.toLocaleString()}`}
          icon={TrendingUp}
          color="text-green-600"
          subtitle="Revenue generated"
        />
        <StatCard
          title="Successful"
          value={stats.successfulTransactions.toLocaleString()}
          icon={Users}
          color="text-green-600"
          subtitle={`${((stats.successfulTransactions / stats.totalTransactions) * 100 || 0).toFixed(1)}% success rate`}
        />
        <StatCard
          title="Pending"
          value={stats.pendingTransactions.toLocaleString()}
          icon={Clock}
          color="text-yellow-600"
          subtitle="Awaiting completion"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Transaction Status Distribution
          </h3>
          <div className="flex justify-center">
            <div className="w-64 h-64">
              <Doughnut 
                data={statusChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Transactions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Monthly Transactions
          </h3>
          <Bar 
            data={monthlyChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {stats.recentTransactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.student_info?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.student_info?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{transaction.transaction_amount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {transaction.custom_order_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard