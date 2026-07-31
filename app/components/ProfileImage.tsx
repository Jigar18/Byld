"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Camera } from "lucide-react";
import ProfileImageModal from "./ProfileImageModal";
import { useUser } from "../context/UserContext";

export default function ProfileImage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userDetails, isOwner, refreshUserDetails, updateUserDetails } = useUser();

  const handleImageChange = async (newImageUrl: string) => {
    updateUserDetails({ imageUrl: newImageUrl });
    await refreshUserDetails();
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div
        {...{ className: "group relative" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-slate-700 relative z-10">
          <img
            src={userDetails?.imageUrl || "/placeholder.png"}
            alt="Profile"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="absolute inset-0 rounded-full blur-xl "></div>

        {/* Edit button that appears on hover */}
        {isOwner && <motion.button
          {...{
            className:
              "absolute bottom-0 right-0 z-20 cursor-pointer rounded-full border-2 border-slate-700 bg-zinc-600 p-2 text-white opacity-100 shadow-lg transition-opacity hover:bg-zinc-700 sm:opacity-0 sm:group-hover:opacity-100",
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              setIsModalOpen(true);
            },
          }}
          aria-label="Edit profile picture"
        >
          <Camera size={16} />
        </motion.button>}
      </motion.div>

      {/* Profile Image Modal */}
      {isOwner && <ProfileImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImageChange={handleImageChange}
        currentImage={userDetails?.imageUrl || ""}
      />}
    </>
  );
}
