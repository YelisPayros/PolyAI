import { AppProps } from 'next/app'
import { AuthProvider } from '../contexts/AuthContext'
import { useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster />
    </AuthProvider>
  )
}

export default MyApp
