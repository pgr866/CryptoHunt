'use client'

import { useEffect, useState } from "react"
import axios from 'axios'
import { useRouter } from "next/navigation"
import { signOut } from 'next-auth/react'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skull, Loader2, Eye, EyeClosed } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useSession } from "next-auth/react"

export function AccountSettingsPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [username, setUsername] = useState(session?.user.username || "")
  const [email, setEmail] = useState(session?.user.email || "")
  const [password, setPassword] = useState(session?.user.password || "")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, router])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "username" | "email" | "password"
  ) => {
    const value = e.target.value
    if (field === "username") setUsername(value)
    if (field === "email") setEmail(value)
    if (field === "password") setPassword(value)

    if (session?.user) {
      session.user[field] = value
    }
  }

  const handleUpdateAccount = async () => {
    if (!username || !email || !password) {
      toast.error("Please fill in all fields.")
      return
    }

    setIsLoading(true)
    try {
      const updatedData: any = {
        username,
        email,
        password,
        id: session?.user?.id,
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-user`,
        updatedData
      )

      update({ user: { ...session.user, ...response.data.user } })
      toast.success(response.data.message || "Account updated successfully")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred while updating the account")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true)
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/delete-user`,
        { data: { email, password } }
      )

      await signOut({ redirect: false })
      toast.success(response.data.message || "Account deleted successfully")
      router.push("/signin")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred while deleting the account")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user) return null

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings.
        </p>
      </div>
      <Separator />
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="username">Username</Label>
        </div>
        <Input
          id="username"
          type="text"
          placeholder="username"
          maxLength={150}
          value={username}
          onChange={(e) => handleInputChange(e, "username")}
          className="max-w-80"
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="email">Email</Label>
        </div>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          maxLength={254}
          value={email}
          onChange={(e) => handleInputChange(e, "email")}
          className="max-w-80"
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Confirm Password</Label>
        </div>
        <div className="relative max-w-80">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Your current password"
            value={password}
            onChange={(e) => handleInputChange(e, "password")}
            className="w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
          </button>
        </div>
      </div>
      <Button onClick={handleUpdateAccount} disabled={isLoading}>
        {isLoading ? (
          <><Loader2 className="animate-spin mr-2" />Loading...</>
        ) : (
          "Update account"
        )}
      </Button>

      <div className="flex flex-row items-center gap-1">
        <Skull className="text-destructive size-6 mb-0.5" />
        <h3 className="text-lg font-medium">Danger Zone</h3>
      </div>
      <Separator />
      <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
        {isLoading ? (
          <><Loader2 className="animate-spin mr-2" />Loading...</>
        ) : (
          "Delete account"
        )}
      </Button>
    </div>
  )
}
