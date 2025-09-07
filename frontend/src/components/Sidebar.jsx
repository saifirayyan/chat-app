import { useEffect, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import SidebarSkeleton from './skeleton/SidebarSkeleton';
import { Users, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = ({setShowSidebar, showSidebar}) => {
    
    const { users, getUsers, selectedUser, setSelectedUser, isUserLoading, unread, getUnreadCounts } = useChatStore();
    const {onlineUsers, authUser} = useAuthStore();
    const [showOnline, setShowOnline] = useState(false);
    useEffect(() => {
        getUsers();
        getUnreadCounts(authUser._id);
    }, []);

    const filteredUsers = showOnline ? users.filter(user => onlineUsers.includes(user._id)) : users;

    // if(isUserLoading) return <SidebarSkeleton />
  return (
    <aside className={`max-sm:absolute max-sm:z-100 max-sm:bg-base-100 h-full w-56 md:w-72 border-r border-base-300 flex flex-col transition-all duration-300 max-sm:shadow-md ${!showSidebar ? "-translate-x-full sm:translate-x-0" : "-translate-x-0"} `}>
        <div className="border-b border-base-300 w-full p-5">
            <div className="flex  w-full justify-between items-center">
                <div className="flex items-center gap-2">
                    <Users className='size-6' />
                    <span className="font-medium">Contacts</span>
                </div>

                <button onClick={() => setShowSidebar(false)} className="btn btn-circle btn-ghost btn-sm sm:hidden">
                    <X size={20} />
                </button>
            </div>
            
            {!isUserLoading && (
                <div className="mt-3 flex items-center flex-row gap-2">
                <label className="cursor-pointer flex items-center gap-2">
                    <input 
                      type="checkbox"  
                      checked={showOnline}
                      onChange={(e) => setShowOnline(e.target.checked)}
                      className='checkbox checkbox-sm checkbox-primary'
                    />
                    <span className='text-sm'>online</span>
                </label>
                <span className='text-xs text-zinc-500'>({onlineUsers.length -1})</span>
            </div>
            )}
        </div>
        {isUserLoading ? (
            <SidebarSkeleton />
        ):
        (<div className="overflow-y-auto w-full py-3">
            {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                      setShowSidebar(false);
                      setSelectedUser(user);
                  }}
                  className={`
                    w-full p-3 flex items-center gap-3 cursor-pointer hover:bg-base-300 transition-colors
                    ${selectedUser?._id === user?._id? "bg-base-300 ring-1 ring-base-300" : ""}
                  `}
                >
                    <div className="relative mx-0">
                        <img src={user.profilePic || "./avatar.png"} alt={user.name} className='size-12 object-cover rounded-full' />
                        {onlineUsers.includes(user._id) && (<span className='absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900 ' />)}
                    </div>

                    <div className="block text-left min-w-0">
                        <div className="font-medium truncate">{user.fullName}</div>
                        <div className="text-sm text-zinc-400">
                            {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                        </div>
                    </div>
                    {unread[user._id] > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {unread[user._id]}
                        </span>
                    )}
                </button>
            ))}
            {filteredUsers.length === 0 && (
                <div className="p-5 text-sm text-center text-zinc-500">
                    No online users.
                </div>
            )}
        </div>)}
    </aside>
  )
}

export default Sidebar