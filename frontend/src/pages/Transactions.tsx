import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { format } from 'date-fns'
import api from '../services/api'

interface Transaction {
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
  status_details?: any
}

interface TransactionFilters {
  status: string
  search: string
  dateFrom: string
  dateTo: string
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  
  const [filters, setFilters] = useState<TransactionFilters>({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  })

  const limit = 10

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, sortField, sortOrder, filters])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sort: sortField,
        order: sortOrder,
      })

      if (filters.status) params.append('status', filters.status)
      
      const response = await api.get(`/transactions?${params}`)
      
      setTransactions(response.data.data)
      setTotalPages(response.data.pagination.pages)
      setTotal(response.data.pagination.total)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const exportTransactions = () => {
    // Create CSV content
    const csvContent = [
      ['Order ID', 'Student Name', 'Email', 'Amount', 'Status', 'Payment Time', 'School ID'],
      ...transactions.map(t => [
        t.custom_order_id,
        t.student_info?.name || '',
        t.student_info?.email || '',
        t.transaction_amount,
        t.status,
        t.payment_time ? format(new Date(t.payment_time), 'yyyy-MM-dd HH:mm:ss') : '',
        t.school_id
      ])
    ]
    .map(row => row.join(','))
    .join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-400" />
    return sortOrder === 'asc' 
      ? <ArrowUp size={14} className="text-primary-500" />
      : <ArrowDown size={14} className="text-primary-500" />
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

  const TransactionDetailsModal = ({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Order Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Order ID:</span> {transaction.custom_order_id}</p>
                <p><span className="font-medium">Collect ID:</span> {transaction.collect_id}</p>
                <p><span className="font-medium">School ID:</span> {transaction.school_id}</p>
                <p><span className="font-medium">Gateway:</span> {transaction.gateway}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Student Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {transaction.student_info?.name}</p>
                <p><span className="font-medium">Email:</span> {transaction.student_info?.email}</p>
                <p><span className="font-medium">Student ID:</span> {transaction.student_info?.id}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Payment Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Order Amount:</span> ₹{transaction.order_amount?.toLocaleString()}</p>
                <p><span className="font-medium">Transaction Amount:</span> ₹{transaction.transaction_amount?.toLocaleString()}</p>
                <p><span className="font-medium">Status:</span> <StatusBadge status={transaction.status} /></p>
                <p><span className="font-medium">Payment Time:</span> {
                  transaction.payment_time ? format(new Date(transaction.payment_time), 'PPpp') : 'N/A'
                }</p>
              </div>
            </div>
            
            {transaction.status_details && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Additional Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Payment Mode:</span> {transaction.status_details.payment_mode}</p>
                  <p><span className="font-medium">Bank Reference:</span> {transaction.status_details.bank_reference}</p>
                  <p><span className="font-medium">Payment Message:</span> {transaction.status_details.payment_message}</p>
                  {transaction.status_details.error_message && (
                    <p><span className="font-medium text-red-600">Error:</span> {transaction.status_details.error_message}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Showing {transactions.length} of {total} transactions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter size={18} className="mr-2" />
            Filters
          </button>
          
          <button
            onClick={exportTransactions}
            className="flex items-center px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by order ID, student name..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading transactions...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('custom_order_id')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Order ID</span>
                        <SortIcon field="custom_order_id" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Student
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('transaction_amount')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Amount</span>
                        <SortIcon field="transaction_amount" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Gateway
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('payment_time')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Payment Time</span>
                        <SortIcon field="payment_time" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {transactions.map((transaction) => (
                    <tr 
                      key={transaction._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                    {currentPage}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  )
}

export default Transactions