import { create } from "zustand";
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,
    unread: {},

    getUsers: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUserLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.messages);
        } finally {
            set({ isMessagesLoading: false });   
        }
    },

    sendMessage: async (messageData) => {
        const {selectedUser, messages} = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });

        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    getUnreadCounts: async (userId) => {
        try {
            const res = await axiosInstance.get(`/messages/unread-counts/${userId}`);
            set({ unread: res.data });
        } catch (error) {
            console.error("Failed to fetch unread counts:", error);
        }
    },
    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        
        socket.on("newMessage", async (newMessage) => {
            const { selectedUser } = get();
            if(selectedUser && newMessage.senderId === selectedUser._id) {
                set({ messages: [...get().messages, newMessage ] });
                await axiosInstance.put(`/messages/seen/${selectedUser._id}`);
            } else {
                socket.on("unreadCount", ({from, count}) => {
                    set({ unread:  {...get().unread, [from]: count } });
                });
            }
        });
        
        socket.on("messagesSeen", ({by}) => {
            set({
                messages: get().messages.map((m) =>
                    m.receiverId === by ? { ...m, seen: true } : m
                ),
            });
        });
    },
    
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if(!socket) return;
        socket.off("newMessage");
        socket.off("unreadCount");
        socket.off("messagesSeen");
    },
        
    setSelectedUser: async(selectedUser, isClose = false) => {
        set({ unread: {...get().unread, [selectedUser._id]: 0} })
        await axiosInstance.put(`/messages/seen/${selectedUser._id}`);
        const currentUserId = useAuthStore.getState().authUser._id;
        
        if(!isClose){
            set({ selectedUser });
            localStorage.setItem(`selectedUser-${currentUserId}`, JSON.stringify(selectedUser));
        }else{
            localStorage.removeItem(`selectedUser-${currentUserId}`);
            set({ selectedUser: null });
        }
    }
        
}));
