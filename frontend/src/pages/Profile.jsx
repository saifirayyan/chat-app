import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore"
import { ArrowRight, Camera, Edit2, Mail, RefreshCcw,  User } from "lucide-react";

const Profile = () => {
  const {authUser, isUpdatingProfile, updateProfile} = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [edit, setEdit] = useState(false);
  const [userName, setUserName] = useState(authUser?.fullName || "");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      await updateProfile({profilePic: base64Image});
    }
  }
  const handleNameUpdate = async () => {
    await updateProfile({fullName: userName});
    setEdit(false);
  }
  
  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img 
                src={selectedImage || authUser?.profilePic || "./avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label 
                htmlFor="avtar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${isUpdatingProfile ? "animate-pulse pointer-events-none": ""}`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input 
                  type="file" 
                  id="avtar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-zinc-400 text-sm">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your profile pic"}
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                User Name
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-base-200 rounded-lg border">
                {edit ? (
                  <input 
                    type="text" 
                    className="w-full border-none outline-none" 
                    autoFocus={true}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)} 
                  /> 
                ) : (
                  <span>{authUser?.fullName}</span>
                )}

                {edit ? (
                  <button className="tooltip tooltip-top btn btn-ghost btn-sm btn-circle" data-tip="Update" onClick={handleNameUpdate}>
                    <RefreshCcw className="size-5" />
                  </button>
                ) : (
                  <button onClick={() => setEdit(true)} className="btn btn-ghost btn-sm btn-circle tooltip tooltip-top" data-tip="Edit">
                    <Edit2 className="size-5" />
                  </button>
                )}
                
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile