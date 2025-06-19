import { useAuth } from '../contexts/AuthContext'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { Chat } from '@/components/custom/chat'
import { generateUUID } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Home() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully!')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to log out.')
    }
  }

  const id = generateUUID()
  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col">
        <div className="flex p-4 justify-end gap-4">
          <Avatar>
            <AvatarImage src="images.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Button onClick={handleSignOut} variant="outline">
            Sign out
          </Button>
        </div>
        <div className="flex-grow"></div>
        <Chat key={id} id={id} initialMessages={[]} />
      </div>
    </ProtectedRoute>
  )
}
