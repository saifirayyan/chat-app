import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import { formateMessageTime } from "../lib/utils";
import { useRef } from "react";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
  }, [selectedUser, getMessages]);
  
  useEffect(() => {
    if(messageEndRef.current && messages){
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  if(isMessagesLoading) return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <MessageSkeleton />
      <ChatInput />
    </div>
  )

  return (
    <div className="flex-1 shrink-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.map((message) => (
          <div 
            key={message._id} 
            className={`chat ${authUser._id === message.senderId ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full">
                <img src={
                  authUser._id === message.senderId ? 
                    authUser.profilePic || "./avatar.png" : 
                    selectedUser.profilePic || "./avatar.png"
                } 
                alt="profile pic" />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">{formateMessageTime(message.createdAt)}</time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img src={message.image} alt="message image" className="sm:max-w-[200px] rounded-md mb-2" />
              )}
              {message.text && (<p>{message.text}</p>)}
            </div>
              <div className="chat-footer self-end opacity-50">
                {authUser._id === message.senderId && (
                  selectedUser && message.seen  ? (
                    <span className="text-xs text-blue-400">seen</span>
                    
                  ) : (
                    <span className="text-xs">delivered</span>
                  )
                )}
              </div>
            
          </div>
        ))}
      </div>

      <ChatInput />
    </div>
  )
}

export default ChatContainer