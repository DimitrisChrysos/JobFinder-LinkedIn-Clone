import { getUserById } from "@utils/getUserFromID";
import { useEffect, useState } from "react"
import { useSession } from 'next-auth/react';
import Link from "next/link";
import Image from "next/image";
import Loading from "./Loading";

const ChatCard = ( { chat } ) => {
    const [user, setUser] = useState(null);
    const { data: session } = useSession();

    useEffect(() => {

        const getUserNameByChat = async () => {
            // get the id of the other participant in the chat
            const chatUserId = chat.participants.filter((participant) => participant !== session?.user.id)[0];
        
            // get the name of the user with the id
            const tempUser = await getUserById(chatUserId)
            setUser(tempUser);
          };

        getUserNameByChat();

    }, [chat._id]);

    if (!user) {
        return (
          <Loading />
        );
    }

  return (


    <div className="flex flex-center items-center gap-2 my-2">
        <div className="relative min-w-[40px] min-h-[40px] w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 p-1">
            <Image 
                src={user?.path}
                alt='avatar' 
                layout="fill"
                objectFit="cover"
                className='absolute inset-0 w-full h-full'  
            />
        </div>
        {!user.admin ? (
          <span>{user.name} {user.surname}</span>
        ) : (
          <span>{user.name}</span>
        )}
    </div>
  )
}

export default ChatCard