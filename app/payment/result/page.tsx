'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CheckCircle2, Clock, XCircle, Loader2, Globe, ExternalLink, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'buatkanweb.id'

interface PaymentDetails {
  id: string
  status: string
  midtrans_status: string
  websites: {
    nama_usaha: string
    subdomain: string
  }
}

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const orderId = searchParams.get('order_id')
  const transactionStatus = searchParams.get('transaction_status')
  
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPayment = async () => {
    if (!orderId) {
      setError('Order ID tidak ditemukan.')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('payments')
        .select('*, websites(nama_usaha, subdomain)')
        .eq('order_id', orderId)
        .single()

      if (error) throw error
      if (data) {
        setPayment(data as any)
      } else {
        setError('Data pembayaran tidak ditemukan.')
      }
    } catch (err: any) {
      console.error('Fetch payment error:', err)
      setError('Terjadi kesalahan saat mengambil data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayment()
  }, [orderId])

  // Auto refresh untuk pending status
  useEffect(() => {
    let interval: NodeJS.Timeout
    const currentStatus = payment?.midtrans_status || transactionStatus

    if (currentStatus === 'pending') {
      interval = setInterval(() => {
        fetchPayment()
      }, 5000) // 5 detik
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [payment, transactionStatus])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#67BAF4] mb-4" />
        <p className="text-zinc-400 animate-pulse">Memuat data pembayaran...</p>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
          <p className="text-zinc-400 mb-8">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  const status = payment.midtrans_status || transactionStatus
  const isSuccess = status === 'settlement' || status === 'capture'
  const isPending = status === 'pending'
  const isFailed = status === 'deny' || status === 'cancel' || status === 'expire'

  const getFailedMessage = (s: string) => {
    if (s === 'deny') return 'Pembayaran ditolak oleh sistem.'
    if (s === 'cancel') return 'Pembayaran dibatalkan oleh pengguna.'
    if (s === 'expire') return 'Sesi pembayaran sudah kedaluwarsa.'
    return 'Pembayaran tidak berhasil.'
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        {isSuccess && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />}
        {isPending && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full" />}
        {isFailed && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-3xl rounded-full" />}

        <div className="relative z-10">
          {isSuccess && (
            <>
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Pembayaran Berhasil! 🎉</h2>
              <p className="text-zinc-400 mb-6 text-[14px]">
                Website <strong className="text-white">{payment.websites?.nama_usaha || 'Bisnis Anda'}</strong> sudah live di internet.
              </p>

              {payment.websites?.subdomain && (
                <a
                  href={`https://${payment.websites.subdomain}.${MAIN_DOMAIN}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-zinc-950 hover:bg-black border border-zinc-800 text-white p-4 rounded-2xl mb-8 transition-colors group"
                >
                  <Globe className="w-5 h-5 text-[#67BAF4]" />
                  <span className="font-medium text-[15px]">{payment.websites.subdomain}.{MAIN_DOMAIN}</span>
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </a>
              )}

              <div className="space-y-3">
                {payment.websites?.subdomain && (
                  <a
                    href={`https://${payment.websites.subdomain}.${MAIN_DOMAIN}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-3.5 bg-gradient-to-r from-[#1E466B] to-[#67BAF4] hover:from-[#255580] hover:to-[#67BAF4] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#1E466B]/20 text-[14px]"
                  >
                    Buka Website Sekarang
                  </a>
                )}
                <Link href="/dashboard" className="block w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium text-[14px]">
                  Kembali ke Dashboard
                </Link>
              </div>
            </>
          )}

          {isPending && (
            <>
              <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Pembayaran Diproses</h2>
              <p className="text-zinc-400 mb-6 text-[14px] leading-relaxed">
                Website <strong className="text-white">{payment.websites?.nama_usaha || 'Bisnis Anda'}</strong> akan aktif dalam beberapa menit setelah pembayaran Anda kami terima.
              </p>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mb-8 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 text-zinc-500 animate-spin" />
                <span className="text-[12px] text-zinc-500">Auto refresh setiap 5 detik...</span>
              </div>

              <Link href="/dashboard" className="block w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium text-[14px]">
                Kembali ke Dashboard
              </Link>
            </>
          )}

          {isFailed && (
            <>
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Pembayaran Gagal</h2>
              <p className="text-zinc-400 mb-8 text-[14px] leading-relaxed">
                {getFailedMessage(status)}
              </p>

              <div className="space-y-3">
                <Link href="/dashboard" className="block w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-semibold transition-colors text-[14px]">
                  Coba Lagi (di Dashboard)
                </Link>
                <Link href="/dashboard" className="block w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium text-[14px]">
                  Batal
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#67BAF4]" />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  )
}
