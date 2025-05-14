'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  username: string
  email: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')

        if (!res.ok) {
          throw new Error('You are not authorized to view this page.')
        }

        const data = await res.json()
        setUser(data)
      } catch (err: any) {
        setError(err.message)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-600">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Your Profile</h1>

      {error ? (
        <p className="text-red-600">{error}</p>
      ) : user ? (
        <div className="space-y-4 text-gray-700">
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="text-lg font-medium">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email}</p>
          </div>

          <hr className="my-4" />
        </div>
      ) : (
        <p className="text-gray-500">User data not found.</p>
      )}
    </div>
  )
}
