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
  Shield,
  Home,
  Database
} from 'lucide-react';

function PaymentCallbackClient() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying your payment...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  useEffect(() => {
    // Only proceed if we have a reference from the URL
    if (reference) {
      let checkCount = 0;
      const maxChecks = 10; // Maximum number of verification attempts
      
      const verifyPayment = async () => {
        try {
          // Call your backend to verify the payment status
          const response = await axios.get(`https://datadoor.onrender.com/api/v1/verify-payment?reference=${reference}`);
          
          if (response.data.success) {
            setStatus('success');
            setMessage('Your deposit was successful! Funds have been added to your wallet.');
            // No need to check anymore
            return true;
          } else if (response.data.data && response.data.data.status === 'failed') {
            setStatus('failed');
            setMessage('Payment failed. Please try again or contact support.');
            return true;
          } else if (checkCount < maxChecks) {
            // Still pending, continue checking
            return false;
          } else {
            // Reached max attempts, tell user to check account later
            setStatus('pending');
            setMessage('Your payment is still processing. Please check your account in a few minutes.');
            return true;
          }
        } catch (error) {
          console.error('Verification error:', error);
          if (checkCount < maxChecks) {
            // Error occurred but still have attempts left
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
          // Wait 3 seconds before checking again
          setTimeout(checkPaymentStatus, 3000);
        }
      };
      
      // Start the verification process
      checkPaymentStatus();
    }
  }, [reference]);

  // Handle redirect to dashboard after success
  useEffect(() => {
    if (status === 'success') {
      // Optionally auto-redirect after a few seconds
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 5000); // Redirect after 5 seconds
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 dark:from-teal-500 dark:to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Database className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Data<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">Door</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Payment Verification</span>
              <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-16">
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
            <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
              {message}
            </p>
            
            {/* Progress Bar for Success */}
            {status === 'success' && (
              <div className="mb-8">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-3">
                  Redirecting to dashboard in 5 seconds...
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full animate-progress" />
                </div>
              </div>
            )}
            
            {/* Reference Display */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Reference ID:</span>
                <span className="text-sm font-mono font-medium text-slate-900 dark:text-white">
                  {reference ? reference.substring(0, 20) + '...' : 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            {status !== 'processing' && (
              <div className="space-y-3">
                <Link href="/" className="block">
                  <button className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-500 dark:to-cyan-500 hover:from-teal-700 hover:to-cyan-700 dark:hover:from-teal-600 dark:hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all font-semibold shadow-lg shadow-teal-500/30">
                    <Home className="w-5 h-5 mr-2" />
                    Return to Dashboard
                  </button>
                </Link>
                
                {status === 'failed' && (
                  <Link href="/deposit" className="block">
                    <button className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800 border border-teal-600 dark:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all font-semibold">
                      Try Again
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </Link>
                )}
                
                {(status === 'failed' || status === 'pending') && (
                  <div className="text-center">
                    <a 
                      href="mailto:datamartghana@gmail.com" 
                      className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold transition-colors"
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
        <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p className="font-semibold mb-1 text-slate-900 dark:text-white">Need Help?</p>
              <p>If you're experiencing issues with your payment, please contact our support team at{' '}
                <a href="mailto:datamartghana@gmail.com" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold transition-colors">
                  datamartghana@gmail.com
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

// Fallback component to show while loading
function PaymentCallbackFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 dark:from-teal-500 dark:to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Database className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Data<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">Door</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Payment Verification</span>
              <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-16">
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
            <p className="text-center text-slate-600 dark:text-slate-400">
              Loading payment details...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the client component with Suspense
export default function PaymentCallback() {
  return (
    <Suspense fallback={<PaymentCallbackFallback />}>
      <PaymentCallbackClient />
    </Suspense>
  );
}