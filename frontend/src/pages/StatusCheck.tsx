import React, { useState } from 'react'
import { Search, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import api from '../services/api'

interface TransactionStatus {
  success: boolean
  order_info: {
    custom_order_id: string
    collect_id: string
    amount: number
    status: string
    payment_details: any
    gateway_response: any
  }
}

const StatusCheck: React.FC = () => {
  const [orderIdInput, setOrderIdInput] = useState('')
  const [status, setStatus] = useState<TransactionStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStatusCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderIdInput.trim()) return

    setLoading(true)
    setError('')
    setStatus(null)

    try {
      const response = await api.get(`/transaction-status/${orderIdInput.trim()}`)
      setStatus(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transaction status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={24} className="text-green-500" />
      case 'pending':
        return <Clock size={24} className="text-yellow-500" />
      case 'failed':
        return <XCircle size={24} className="text-red-500" />
      default:
        return <AlertCircle size={24} className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Status Check</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enter a custom order ID to check the current transaction status
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleStatusCheck} className="space-y-4">
          <div>
            <label htmlFor="orderIdInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Order ID
            </label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                id="orderIdInput"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Enter order ID (e.g., ORDER_1703001001_abc123)"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !orderIdInput.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Checking Status...
              </>
            ) : (
              <>
                <Search size={18} className="mr-2" />
                Check Status
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center animate-slide-up">
          <AlertCircle className="text-red-500 mr-3" size={20} />
          <div className="text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Status Results */}
      {status && (
        <div className="space-y-6 animate-slide-up">
          {/* Status Overview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction Status</h2>
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.order_info.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(status.order_info.status)}`}>
                  {status.order_info.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Order ID
                  </label>
                  <p className="text-lg font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    {status.order_info.custom_order_id}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Collect ID
                  </label>
                  <p className="text-lg font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    {status.order_info.collect_id}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Transaction Amount
                  </label>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{status.order_info.amount?.toLocaleString() || '0'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Last Updated
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {format(new Date(), 'PPpp')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {status.order_info.payment_details && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Payment Mode:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {status.order_info.payment_details.payment_mode || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Bank Reference:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {status.order_info.payment_details.bank_reference || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Order Amount:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{status.order_info.payment_details.order_amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Transaction Amount:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{status.order_info.payment_details.transaction_amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Payment Time:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {status.order_info.payment_details.payment_time 
                        ? format(new Date(status.order_info.payment_details.payment_time), 'PPpp')
                        : 'N/A'
                      }
                    </span>
                  </div>
                  
                  {status.order_info.payment_details.error_message && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Error Message:</span>
                      <span className="text-sm font-medium text-red-600">
                        {status.order_info.payment_details.error_message}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {status.order_info.payment_details.payment_message && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Payment Message:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {status.order_info.payment_details.payment_message}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gateway Response (Debug Info) */}
          {status.order_info.gateway_response && (
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gateway Response</h3>
              <pre className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-lg overflow-x-auto border">
                {JSON.stringify(status.order_info.gateway_response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Sample Order IDs */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Sample Order IDs for Testing:
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p className="font-mono">ORDER_1703001001_abc123</p>
          <p className="font-mono">ORDER_1703001002_def456</p>
          <p className="font-mono">ORDER_1703001003_ghi789</p>
        </div>
      </div>
    </div>
  )
}

export default StatusCheck