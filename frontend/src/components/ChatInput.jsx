import { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import { Image, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const ChatInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const {sendMessage} = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    }
    reader.readAsDataURL(file);
  }
  const removeImage = () => {
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(!text.trim() && !imagePreview) return;

    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error("Failed to send message");
    }
  }
  return (
    <div className='relative p-4 w-full'>
      {imagePreview && (
        <div className="absolute bottom-14 mb-3 flex items-center gap-2 w-full">
          <div className="relative">
            <img src={imagePreview} alt="preview" className='h-20 w-20 object-cover rounded-lg border border-zinc-700' />
            <button onClick={removeImage} className='btn absolute -top-2 -right-2 w-5 h-5 bg-base-300 flex items-center justify-center rounded-full p-1'>
              <X className='size-3' />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
        <div className="flex-1 flex gap-2">
          <input 
            type='text'
            className='input input-bordered w-full rounded-lg input-sm sm:input-md'
            placeholder='Type a message...'
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
          />
          <input type="file" accept='image/*' className='hidden' ref={fileInputRef} onChange={handleImageChange} />
          <button type='button' onClick={() => fileInputRef.current?.click()} className={`flex btn btn-circle ${imagePreview ? 'text-emerald-500' : 'text-zinc-400'}`}>
            <Image size={20} />  
          </button>
        </div>
        <button 
          type='submit' 
          className='btn btn-circle'
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  )
}

export default ChatInput