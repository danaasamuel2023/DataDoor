'use client'

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Home,
} from 'lucide-react';

function PaymentCallbackClient() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying your payment...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  useEffect(() => {
    if (reference) {
      let checkCount = 0;
      const maxChecks = 10;
      
      const verifyPayment = async () => {
        try {
          const response = await axios.get(`https://datadoor.onrender.com/api/v1/verify-payment?reference=${reference}`);
          
          if (response.data.success) {
            setStatus('success');
            setMessage('Your deposit was successful! Funds have been added to your wallet.');
            return true;
          } else if (response.data.data && response.data.data.status === 'failed') {
            setStatus('failed');
            setMessage('Payment failed. Please try again or contact support.');
            return true;
          } else if (checkCount < maxChecks) {
            return false;
          } else {
            setStatus('pending');
            setMessage('Your payment is still processing. Please check your account in a few minutes.');
            return true;
          }
        } catch (error) {
          console.error('Verification error:', error);
          if (checkCount < maxChecks) {
            return false;
          } else {
            setStatus('failed');
            setMessage('An error occurred while verifying your payment. Please contact support.');
            return true;
          }
        }
      };
      
      const checkPaymentStatus = async () => {
        const isComplete = await verifyPayment();
        
        if (!isComplete) {
          checkCount++;
          setTimeout(checkPaymentStatus, 3000);
        }
      };
      
      checkPaymentStatus();
    }
  }, [reference]);

  useEffect(() => {
    if (status === 'success') {
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 5000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [status, router]);

  const statusConfig = {
    processing: {
      icon: <Loader2 className="w-16 h-16 text-teal-600 dark:text-teal-400 animate-spin" />,
      iconBg: 'bg-teal-100 dark:bg-teal-900/40',
      statusText: 'Processing',
      statusColor: 'text-teal-700 dark:text-teal-400'
    },
    success: {
      icon: <CheckCircle className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      statusText: 'Success',
      statusColor: 'text-emerald-700 dark:text-emerald-400'
    },
    failed: {
      icon: <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />,
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      statusText: 'Failed',
      statusColor: 'text-red-700 dark:text-red-400'
    },
    pending: {
      icon: <Clock className="w-16 h-16 text-amber-600 dark:text-amber-400" />,
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      statusText: 'Pending',
      statusColor: 'text-amber-700 dark:text-amber-400'
    }
  };

  const currentConfig = statusConfig[status] || statusConfig.processing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Status Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Payment {currentConfig.statusText}
              </h2>
              <span className={`text-sm font-semibold ${currentConfig.statusColor}`}>
                Status: {currentConfig.statusText}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* Icon Display */}
            <div className="flex justify-center mb-6">
              <div className={`${currentConfig.iconBg} rounded-full p-6`}>
                {currentConfig.icon}
              </div>
            </div>
            
            {/* Message */}
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              {message}
            </p>
            
            {/* Progress Bar for Success */}
            {status === 'success' && (
              <div className="mb-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">
                  Redirecting to dashboard in 5 seconds...
                </p>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-teal-600 dark:bg-teal-500 rounded-full animate-progress" />
                </div>
              </div>
            )}
            
            {/* Reference Display */}
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Reference ID:</span>
                <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                  {reference ? reference.substring(0, 20) + '...' : 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            {status !== 'processing' && (
              <div className="space-y-3">
                <Link href="/" className="block">
                  <button className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors font-medium">
                    <Home className="w-5 h-5 mr-2" />
                    Return to Dashboard
                  </button>
                </Link>
                
                {status === 'failed' && (
                  <Link href="/deposit" className="block">
                    <button className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800 border border-teal-600 dark:border-teal-500 hover:bg-teal-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors font-medium">
                      Try Again
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </Link>
                )}
                
                {(status === 'failed' || status === 'pending') && (
                  <div className="text-center">
                    <a 
                      href="mailto:support@datadoor.com" 
                      className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                    >
                      Contact Support
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium mb-1">Need Help?</p>
              <p>If you're experiencing issues with your payment, please contact our support team at{' '}
                <a href="mailto:support@datadoor.com" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                  support@datadoor.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
}

function PaymentCallbackFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Payment Processing
            </h2>
          </div>

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-teal-100 dark:bg-teal-900/40 rounded-full p-6">
                <Loader2 className="w-16 h-16 text-teal-600 dark:text-teal-400 animate-spin" />
              </div>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-300">
              Loading payment details...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={<PaymentCallbackFallback />}>
      <PaymentCallbackClient />
    </Suspense>
  );
}