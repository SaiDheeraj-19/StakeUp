"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/store/notifications";
import { Bell, Check, Trash, CheckCircle2, ShieldAlert, Trophy, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function NotificationsPage() {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      case 'battle': return <Trophy className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-[#1a1a1a] flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Notifications
          </h1>
          <p className="text-[#1a1a1a]/50 mt-2 font-medium">Stay updated on your battles and challenges.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 rounded-full font-medium transition-colors text-sm"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-[32px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading && notifications.length === 0 ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-1">You're all caught up!</h3>
            <p className="text-zinc-500">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {notifications.map((notification, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={notification.id} 
                className={`p-6 flex gap-4 transition-colors ${notification.is_read ? 'bg-white' : 'bg-indigo-50/30'}`}
              >
                <div className="mt-1 shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold text-lg ${notification.is_read ? 'text-zinc-700' : 'text-zinc-900'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-zinc-400 font-medium whitespace-nowrap ml-4">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-base ${notification.is_read ? 'text-zinc-500' : 'text-zinc-700'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="shrink-0 flex items-center">
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
