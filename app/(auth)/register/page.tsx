'use client'

import { LoginForm } from '@/components/register-form'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Image src="/logo.png" alt="PolyAI Logo" width={32} height={32} />
          PolyAI
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
