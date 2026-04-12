"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { AppUser, UserRole } from "@/types"

interface AuthContextType {
  user: AppUser | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  sendResetEmail: (email: string) => Promise<void>
  updateUserPassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache user profile in sessionStorage to avoid Firestore read on every page load
const USER_CACHE_KEY = "facilione-user-cache"

function getCachedUser(): AppUser | null {
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppUser
  } catch {
    return null
  }
}

function setCachedUser(user: AppUser | null) {
  try {
    if (user) {
      sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(USER_CACHE_KEY)
    }
  } catch {
    // sessionStorage not available
  }
}

function buildMinimalUser(fbUser: FirebaseUser): AppUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email || "",
    displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
    role: "pm" as UserRole,
    orgId: "default",
    assignedProjectIds: [],
    managedUserIds: [],
    forcePasswordChange: false,
    createdAt: new Date().toISOString(),
    createdBy: "system",
  }
}

function normalizeAppUser(fbUser: FirebaseUser, raw: Partial<AppUser> | null | undefined): AppUser {
  return {
    uid: fbUser.uid,
    email: raw?.email || fbUser.email || "",
    displayName: raw?.displayName || fbUser.displayName || fbUser.email?.split("@")[0] || "User",
    role: (raw?.role || "pm") as UserRole,
    orgId: raw?.orgId || "default",
    assignedProjectIds: Array.isArray(raw?.assignedProjectIds) ? raw!.assignedProjectIds : [],
    managedUserIds: Array.isArray(raw?.managedUserIds) ? raw!.managedUserIds : [],
    forcePasswordChange: Boolean(raw?.forcePasswordChange),
    createdAt: raw?.createdAt || new Date().toISOString(),
    createdBy: raw?.createdBy || "system",
    avatarUrl: raw?.avatarUrl,
  }
}

function setSessionCookie(token: string) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`
}

function clearSessionCookie() {
  document.cookie = "__session=; path=/; max-age=0"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const profileFetchedRef = useRef<string | null>(null)

  useEffect(() => {
    const unsubscribeToken = onIdTokenChanged(auth, async (fbUser) => {
      if (!fbUser) {
        clearSessionCookie()
        return
      }

      const token = await fbUser.getIdToken()
      setSessionCookie(token)
    })

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        const token = await fbUser.getIdToken()
        setSessionCookie(token)

        // Use cached profile if available for the same UID — render instantly
        const cached = getCachedUser()
        if (cached && cached.uid === fbUser.uid) {
          setUser(cached)
          setLoading(false)

          // Refresh profile in background (non-blocking) if not already fetched this session
          if (profileFetchedRef.current !== fbUser.uid) {
            profileFetchedRef.current = fbUser.uid
            fetchAndCacheProfile(fbUser).then((freshUser) => {
              if (freshUser) setUser(freshUser)
            })
          }
          return
        }

        // No cache — fetch from Firestore (first load only)
        profileFetchedRef.current = fbUser.uid
        const profile = await fetchAndCacheProfile(fbUser)
        setUser(profile)
      } else {
        // Signed out
        clearSessionCookie()
        setUser(null)
        setCachedUser(null)
        profileFetchedRef.current = null
      }

      setLoading(false)
    })

    return () => {
      unsubscribeToken()
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const token = await cred.user.getIdToken()
    setSessionCookie(token)
  }

  const signOut = async () => {
    clearSessionCookie()
    setCachedUser(null)
    profileFetchedRef.current = null
    await firebaseSignOut(auth)
    setUser(null)
  }

  const sendResetEmail = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const updateUserPassword = async (newPassword: string) => {
    if (!firebaseUser) throw new Error("Not authenticated")
    await updatePassword(firebaseUser, newPassword)
  }

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, loading, signIn, signOut, sendResetEmail, updateUserPassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

// ── Helper ──

async function fetchAndCacheProfile(fbUser: FirebaseUser): Promise<AppUser> {
  try {
    const userDoc = await getDoc(doc(db, "users", fbUser.uid))
    if (userDoc.exists()) {
      const profile = normalizeAppUser(fbUser, userDoc.data() as Partial<AppUser>)
      setCachedUser(profile)
      return profile
    }
  } catch (err) {
    console.error("Error loading user profile:", err)
  }

  // Fallback: build minimal profile from Firebase Auth record
  const minimal = buildMinimalUser(fbUser)
  setCachedUser(minimal)
  console.warn(
    `No Firestore user doc for ${fbUser.uid}. Using minimal profile. ` +
    `Create a proper user doc via Admin > Users.`,
  )
  return minimal
}
