"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, Trash2, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notifications"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"

export function NotificationBell() {
  const language = useLanguage()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  const unreadCount = notifications.filter(n => !n.read).length
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let channel: any

    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const result = await getNotifications()
        if (result.success && result.data) {
          setNotifications(result.data)
        }
      }
      setLoading(false)
    }

    fetchNotifications()

    // We can't easily subscribe directly with row level security if we don't have the user ID yet
    // so we get the user first, then subscribe
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        channel = supabase
          .channel('realtime-notifications')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setNotifications(prev => [payload.new, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n))
              } else if (payload.eventType === 'DELETE') {
                setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
              }
            }
          )
          .subscribe()
      }
    })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await markNotificationAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await markAllNotificationsAsRead()
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return language === 'es' ? 'hace un momento' : 'just now'
    
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return language === 'es' ? `hace ${minutes} m` : `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return language === 'es' ? `hace ${hours} h` : `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    if (days < 7) return language === 'es' ? `hace ${days} d` : `${days}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
        aria-label={language === 'es' ? 'Notificaciones' : 'Notifications'}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-destructive rounded-full px-1 border-2 border-background">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 className="font-semibold text-foreground">
              {language === 'es' ? 'Notificaciones' : 'Notifications'}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:underline font-medium flex items-center"
              >
                <Check className="w-3 h-3 mr-1" />
                {language === 'es' ? 'Marcar todas como leídas' : 'Mark all as read'}
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {language === 'es' ? 'Cargando...' : 'Loading...'}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                {language === 'es' ? 'No tienes notificaciones' : 'You have no notifications'}
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg flex gap-3 transition-colors ${notification.read ? 'bg-transparent hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'}`}
                  >
                    {!notification.read && (
                      <div className="mt-1.5 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {notification.link ? (
                        <Link 
                          href={notification.link}
                          onClick={() => {
                            if (!notification.read) handleMarkAsRead(notification.id)
                            setIsOpen(false)
                          }}
                          className="block"
                        >
                          <p className="text-sm font-semibold text-foreground truncate">{notification.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-snug">{notification.message}</p>
                        </Link>
                      ) : (
                        <div 
                          onClick={() => {
                            if (!notification.read) handleMarkAsRead(notification.id)
                          }}
                          className="cursor-pointer"
                        >
                          <p className="text-sm font-semibold text-foreground truncate">{notification.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-snug">{notification.message}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-1.5">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
