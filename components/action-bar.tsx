'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function ActionBar() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully!')
      router.push('/login')
    } catch {
      toast.error('Failed to log out.')
    }
  }

  return (
    <div className="flex p-4 justify-end gap-4 absolute backdrop-blur-md w-full">
      <Avatar>
        <AvatarImage src="images.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Button onClick={handleSignOut} variant="outline">
        Sign out
      </Button>
    </div>
  )
}
