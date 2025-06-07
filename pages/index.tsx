import { useAuth } from '../contexts/AuthContext'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Welcome to Dashboard</h1>
              </div>
              <div className="flex items-center">
                <span className="mr-4 text-gray-600">{user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500 text-xl">Your content goes here</p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
