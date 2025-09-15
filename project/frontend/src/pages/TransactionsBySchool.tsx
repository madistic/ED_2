import React, { useState, useEffect } from 'react'
import { Building2, Search, Filter, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import api from '../services/api'

interface SchoolTransaction {
  _id: string
  collect_id: string
  school_id: string
  gateway: string
  order_amount: number
  transaction_amount: number
  status: 'success' | 'pending' | 'failed'
  custom_order_id: string
  student_info: {
    name: string
    email: string
    id: string
  }
  payment_time: string
}

const TransactionsBySchool: React.FC = () => {
  const [transactions, setTransactions] = useState<SchoolTransaction[]>([])
  const [selectedSchool, setSelectedSchool] = useState('')
  const [schools, setSchools] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const limit = 10

  useEffect(() => {
    fetchSchools()
  }, [])

  useEffect(() => {
    if (selectedSchool) {
      fetchTransactionsBySchool()
    }
  }, [selectedSchool, currentPage, searchTerm])

  const fetchSchools = async () => {
    try {
      // Get unique school IDs from all transactions
      const response = await api.get('/transactions?limit=1000')
      const allTransactions = response.data.data
      const uniqueSchools = [...new Set(allTransactions.map((t: any) => t.school_id))]
      setSchools(uniqueSchools)
      
      // Set default school if available
      if (uniqueSchools.length > 0) {
        setSelectedSchool(uniqueSchools[0])
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error)
    }
  }

  const fetchTransactionsBySchool = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/transactions/school/${selectedSchool}?page=${currentPage}&limit=${limit}`)
      
      let filteredTransactions = response.data.data
      
      // Client-side search filtering
      if (searchTerm) {
        filteredTransactions = filteredTransactions.filter((t: SchoolTransaction) =>
          t.custom_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.student_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.student_info?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setTransactions(filteredTransactions)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch transactions by school:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusStats = () => {
    const stats = {
      total: transactions.length,
      success: transactions.filter(t => t.status === 'success').length,
      pending: transactions.filter(t => t.status === 'pending').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      totalAmount: transactions.reduce((sum, t) => sum + t.transaction_amount, 0)
    }
    return stats
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      success: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status}
      </span>
    )
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions by School</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View transactions filtered by school ID
          </p>
        </div>
      </div>

      {/* School Selection */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select School
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-3 text-gray-400" />
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="">Select a school...</option>
                {schools.map((school) => (
                  <option key={school} value={school}>
                    School ID: {school}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Transactions
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID, student name, email..."
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {selectedSchool && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">₹{stats.totalAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {selectedSchool && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No transactions found for this school</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Order ID
                    </th>
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
                      Gateway
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Payment Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {transaction.custom_order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.student_info?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.student_info?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ₹{transaction.transaction_amount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={transaction.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.gateway}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {transaction.payment_time ? format(new Date(transaction.payment_time), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TransactionsBySchool