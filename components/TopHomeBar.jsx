import Link from "next/link"
import { HiOutlineBell, HiOutlineBriefcase, HiOutlineChat, HiOutlineCog, HiOutlinePhotograph, HiOutlineThumbUp, HiOutlineUpload, HiOutlineUserCircle, HiX } from "react-icons/hi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { HiOutlineHome } from "react-icons/hi";

const TopHomeBar = ({ user }) => {
  return (
    <>
        <Link href='/home' className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
          <HiOutlineHome size={26}/>
          <span className="text-base font-semibold">Home</span>
        </Link>
        <Link href={`/network/${user._id}`} className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
          <HiOutlineUserGroup size={26}/>
          <span className="text-base font-semibold">Network</span>
        </Link>
        <Link href='/listings/' className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
          <HiOutlineBriefcase size={26}/>
          <span className="text-base font-semibold">Job Listings</span>
        </Link>
        <Link href={'/conversations/'} className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
          <HiOutlineChat size={26}/>
          <span className="text-base font-semibold">Chats</span>
        </Link>
        <Link href='/notifications' className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
          <HiOutlineBell size={26}/>
          <span className="text-base font-semibold">Notifications</span>
        </Link>
        <Link href={`/profile_info`} className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
          <HiOutlineUserCircle size={26}/>
          <span className="text-base font-semibold">Profile</span>
        </Link>
        <Link href={`/settings/${user._id}`} className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
          <HiOutlineCog size={26}/>
          <span className="text-base font-semibold">Settings</span>
        </Link>
    </>
  )
}

export default TopHomeBar