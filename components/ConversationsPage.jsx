'use client';

import { getUserById } from "@utils/getUserFromID";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react"
import ChatCard from "./ChatCard";
import Image from "next/image";
import { FaSpinner } from "react-icons/fa";
import Loading from "./Loading";

const ConversationsPage = ({ user }) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([-1]);
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const [otherChatUserId, setOtherChatUserId] = useState(null);
  const [otherChatUser, setOtherChatUser] = useState(null);
  const [curChat, setCurChat] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [prevMessagesLength, setPrevMessagesLength] = useState(messages.length);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the other chat user
  useEffect(() => {
    const fetchOtherUser = async () => {
      const tempUser = await getUserById(otherChatUserId);
      setOtherChatUser(tempUser);
    }

    if(otherChatUserId) {
      fetchOtherUser();
    }
  }, [otherChatUserId]);

  // Scroll to the bottom of the messages container
  useEffect(() => {
    if (messagesEndRef.current && messages.length !== prevMessagesLength) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setPrevMessagesLength(messages.length);
    }

  }, [curChat, messages]);

  // Function to get all the messages of a chatId
  const getAllMessages = async (chat) => {
    try {
      const res = await fetch(`/api/chats/messages?chatId=${chat._id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await res.json();
      setMessages(data.data[0].message);
    } catch (error) {
      console.log("Error fetching messages: ", error);
    }
  }

  // Function to handle the chat click event and usefull for the first visit
  const handleChatClick = async (chat) => {
    setCurChat(chat); // Set the current chat
    setPrevMessagesLength(messages.length);
    setOtherChatUserId(chat?.participants.find((participant) => participant !== session?.user.id));
    getAllMessages(chat); // Get all the messages of the chat
  };
  
  // Function to handle the last chat when you open the page for the first time
  const handleLastChat = async (chatId) => {
    if (chatId === "") {
      return;
    }
    else {
      try {
        const res = await fetch(`/api/chats/get-chat-by-id?chatId=${chatId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch chat');
        }
        const data = await res.json();
        handleChatClick(data.data);
      } catch (error) {
        console.log("Error fetching chat: ", error);
      }
    }
  };

  // Get the other chat user id
  useEffect(() => {
    if (curChat) {
      setOtherChatUserId(curChat.participants.find((participant) => participant !== session?.user.id));
      getAllMessages(curChat); // Get all the messages of the current chat
    }
  }, [chats]);

  // The initial fetch to get all the chats of the user
  // and the polling to get the chats every 3 seconds
  useEffect(() => {
    let polling = true;

    const getChats = async () => {
      try {
        const res = await fetch(`/api/chats/?userId=${session?.user.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch chats');
        }
        const data = await res.json();
        if (polling) {
          setChats(data.chats);
          setLoading(false);
        }
      } catch (error) {
        console.log("Error fetching chats: ", error);
        setLoading(false);
      } finally {
        if (polling) {
          setTimeout(getChats, 3000);
        }
      }
    }
    handleLastChat(user.lastChatId);
    getChats();

    return () => {
      polling = false;
    };
  }, [user.lastChatId]);

  if (loading) {
    return (
      <Loading />
    );
  }

  // Function to handle the text change event on send message textarea
  const handleTextChange = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto'; // Reset the height
    e.target.style.height = `${e.target.scrollHeight}px`; // Set the height based on the scroll height
  };

  // Update the last chat id of the users
  const updateUsersLastChat = async (chatId) => {
    const res = await fetch(`/api/chats/update-last-chat/${session?.user.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newChatId: chatId })
    });
    if (!res.ok)
        console.log("Error updating last chat");

    const res1 = await fetch(`/api/chats/update-last-chat/${otherChatUserId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newChatId: chatId })
    });
    if (!res1.ok)
        console.log("Error updating last chat");
};

  // Function to handle the send message event
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    if (text.trim() === '') {
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/chats/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chatId: curChat._id,
          senderId: session?.user.id,
          receiverId: otherChatUserId,
          content: text })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.data[0].message);
        updateUsersLastChat(curChat._id)
        setText('');

        // Reset the textarea height to its original size
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'; // Reset to original height
        }
        
      } else {
        console.log('Failed to send message');
      }
    } catch (error) {
      console.log('Failed to send message: ', error);
    }


    // Re-enable the button after submission
    setIsSubmitting(false);
  }
  
  return (
    <div className="mt-20 w-full flex min-h-screen items-start justify-start">

      {/* left part */}
      <div className="p-6 w-1/5 min-w-[250px] border-r border-gray-300 h-full text-left sticky top-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chats:</h2>
        <hr className="w-10 border-t-4 border-blue-400 mb-4" />
        {chats.map((chat) => (
          <div 
            onClick={() => handleChatClick(chat)} 
            className="my-2 cursor-pointer py-2 px-4 rounded-lg border border-gray-300 hover:border-gray-500 transition-transform duration-300 transform hover:scale-105"
          >
            <ChatCard chat={chat}/>
          </div>
        ))}
      </div>

      {/* right part */}
      <div className="p-6 flex-grow flex flex-col text-left h-full">

        {/* Scrollable messages container */}
        <div className="flex-grow overflow-y-auto mb-4 mt-20">

          {/* Other chat user info */}
          {curChat && (
            <>
              <div className="flex items-center gap-2 my-2 justify-start">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300 p-1">
                    <Image 
                        src={otherChatUser?.path}
                        alt='avatar' 
                        layout="fill"
                        objectFit="cover"
                        className='absolute inset-0 w-full h-full'  
                    />
                </div>
                { !otherChatUser?.admin ? (
                  <span className="text-lg">{otherChatUser?.name} {otherChatUser?.surname}</span>
                ) : (
                  <span className="text-lg">{otherChatUser?.name}</span>
                )}
              </div>
              <hr className="border-t-2 border-gray-300 my-2 w-full mb-10" />
            </>
          )}

          {/* Messages Container */}
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">
              No messages to display.
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className={`w-full flex my-2 ${msg.senderId._id === session?.user.id ? 'justify-end' : 'justify-start'}`}>
                {msg.senderId._id === session?.user.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-right break-words bg-blue-200 px-4 py-2 rounded-lg max-w-3/4 whitespace-pre-wrap">{msg.content}</span>
                    <div className="relative w-10 h-10 min-w-[40px] min-h-[40px] rounded-full overflow-hidden border-2 border-gray-300 p-1">
                      <Image 
                        src={msg.senderId.path}
                        alt="avatar"
                        layout="fill"
                        objectFit="cover"
                        className="absolute inset-0 w-full h-full"  
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="text-left relative w-10 h-10 min-w-[40px] min-h-[40px] rounded-full overflow-hidden border-2 border-gray-300 p-1">
                      <Image 
                        src={msg.senderId.path}
                        alt="avatar"
                        layout="fill"
                        objectFit="cover"
                        className="absolute inset-0 w-full h-full"  
                      />
                    </div>
                    <span className="break-words bg-gray-200 px-4 py-2 rounded-lg max-w-3/4 whitespace-pre-wrap">{msg.content}</span>
                  </div>
                )}
              </div>
            ))
          )}
          {/* Dummy div to scroll into view */}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed send message form at the bottom of the page*/}
        {curChat && (
          <form 
            onSubmit={handleSendMessage} 
            className="flex items-center mx-auto w-10/12 gap-2 p-5 shadow-2xl space-x-2 rounded-lg border-t-4 border-blue-400 bg-white sticky bottom-6"
          >
            <textarea
                ref={textareaRef}
                onChange={handleTextChange} 
                value={text}
                placeholder="Send a new message..."
                style={{ overflow: 'hidden', resize: 'none', width: '90%' }} // Prevent manual resizing
                className="border border-gray-400 p-2 rounded-md w-full flex flex-col justify-between focus:outline-none"
                rows="1"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isSubmitting}
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ConversationsPage