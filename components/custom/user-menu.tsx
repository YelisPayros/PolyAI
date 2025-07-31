'use client'

import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'
import { User } from '@supabase/supabase-js'
import { ThemeToggle } from './theme-toggle'

export function UserMenu({ user }: { user: User | undefined }) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="py-1.5 px-2 h-fit font-normal" variant="secondary">
          {user?.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <ThemeToggle />
        </DropdownMenuItem>
        <DropdownMenuItem className="p-1 z-50">
          <form className="w-full" action={handleSignOut}>
            <button
              type="submit"
              className="w-full text-left px-1 py-0.5 text-red-500 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
