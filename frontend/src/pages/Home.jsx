import React, { useEffect, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import Sidebar from '../components/Sidebar';
import NoChatSelected from '../components/NoChatSelected';
import ChatContainer from '../components/ChatContainer';
import { useAuthStore } from '../store/useAuthStore';
import { SidebarOpen } from 'lucide-react';

const Home = () => {
  const [showSidebar, setShowSidebar] = useState(false)
  const { selectedUser, setSelectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const {authUser} = useAuthStore();

  useEffect(() => {
    const storedUser = localStorage.getItem(`selectedUser-${authUser._id}`);
    if(storedUser){
      setSelectedUser(JSON.parse(storedUser));
    }
  },[]);
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  },[selectedUser]);

  return (
    <div className='h-[100dvh-60px] bg-base-200'>
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl sm:h-[calc(100vh-6rem)] h-[calc(100dvh-8rem)] shrink">
          <div className="max-sm:relative flex h-full rounded-lg overflow-hidden">
            {!showSidebar && (<button className='absolute top-4 left-4 z-100 btn btn-square btn-ghost btn-sm sm:hidden' onClick={() => setShowSidebar(true)}>
              <SidebarOpen className='text-primary size-5 font-medium'  />
            </button>) }
              <Sidebar setShowSidebar={setShowSidebar} showSidebar={showSidebar} />
              {!showSidebar && <div className="transition-all duration-200 sm:hidden">
                 <Sidebar setShowSidebar={setShowSidebar} showSidebar={showSidebar} />
              </div>}
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home