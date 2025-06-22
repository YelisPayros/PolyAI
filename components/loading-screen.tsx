import { Loader } from 'lucide-react'

export function Loading() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Loader className="animate-pulse text-gray-400" />
    </div>
  )
}
