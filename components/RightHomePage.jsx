import { useRef, useState } from "react";
import { HiOutlineUpload, HiX } from "react-icons/hi";
import { join } from "path";

const RightHomePage = ({ user, posts, setPosts}) => {
    const fileInputRef = useRef(null);
    const [file , setFile] = useState(null);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [flMessage, setFlMessage] = useState('Add File');

    // Function to open the file input dialog when the file icon is clicked on Create Post
    const handleClick = () => {
        fileInputRef.current.click();
    };

    // Function to handle the file change event on Create Post
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        if (file) {
            console.log("Selected file:", file);
        }
    };

    // Function to handle the text change event on Create Post
    const handleTextChange = (e) => {
        setText(e.target.value);
        e.target.style.height = 'auto'; // Reset the height
        e.target.style.height = `${e.target.scrollHeight}px`; // Set the height based on the scroll height
    };

    // Function to handle the form submission on Create Post
    const handleSubmit = async (e) => {

      // Prevents the page from refreshing
      e.preventDefault();
      
      // Check if both of the fields are empty
      if (!text && !file) {
        setError("Please add text or a file");
        return;
      }
      
      // Disable the button for form submission for 3 seconds to prevent multiple submissions
      setIsButtonDisabled(true); // Disable the button
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 3000); // Enable the button after 3 seconds

      // To save the file in the server
      if (file) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("post_counter", user.post_counter);  // Add the post_counter to formData
        formData.set("email", user.email);  // Add the email to formData
    
        const resFile = await fetch('/api/postFiles', {
            method: "POST",
            body: formData
        });
        
        if (!resFile.ok) {
            console.log("File upload failed");
            return;
        }
      }

      // Call the makePost function to create the post
      makePost();
      
      // Reset the form
      const form = e.target;
      form.reset();
      setText("");
      setFile(null);
      setError("");
    }

    // Function to create a post
    const makePost = async () => {

      // Fetch request to create a post
      const path = 
      file ? 
          join('assets', 'post_files', `${user.post_counter}_${user.email}_${file.name}`) 
        : 
          null;
      const res = await fetch("/api/post", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({userId: user._id, text, path})
      });
      if (!res.ok) {
          console.log("Post creation failed.");
      }
      const data = await res.json();
      const post = data.post;

      // Add a view to the post
      const res1 = await fetch('/api/post/views', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postIds : [ post._id ] }),
      });
      if (!res1.ok) {
        throw new Error('Failed to add a view to post');
      }

      // To view post at the top of the posts
      setPosts([post, ...posts]);
      
      // If the request is successful, update the user's profile
      if (!res.ok) {
          console.log("Post creation failed.");
      } else {
          await updateProfile();
      }
    }

    // Function to update the user's profile by adding one to the post_counter
    const updateProfile = async () => {
      try {

      // Fetch request to update the user's profile
      const res = await fetch(`/api/profile/${user._id}`, {
        method: "PUT",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        newName: user.name, 
        newSurname: user.surname, 
        newEmail: user.email, 
        newPhoneNumber: user.phone_number, 
        newPath: user.path,
        newPostCounter: user.post_counter + 1,
        newListingCounter: user.listing_counter
        })
      });

      if (!res.ok) {
        throw new Error("Failed to update user data");
      }
      } catch (error) {
        console.log(error);
      }
    }

    return (
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-blue-400 sticky top-20">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">

          <div className="border border-gray-400 p-2 rounded-md w-full flex flex-col justify-between">
            <textarea 
              onChange={handleTextChange} 
              value={text}
              placeholder="Write a new post..."
              style={{ overflow: 'hidden', resize: 'none' }} // Prevent manual resizing
              className="w-full focus:outline-none"
            />
            
            <div>
              {!file && (
                <>
                  <button type="button"
                    onClick={handleClick}
                    className="flex items-center px-2 py-2 text-gray-400 font-bold">
                      <HiOutlineUpload className="mr-2 text-lg" />
                      <span className="text-sm">{flMessage}</span>
                  </button>
                  <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: "none" }} // Hide the file input
                  />
                </>
              )}
              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFlMessage('Add File');
                  }}
                  className="flex items-center px-2 py-2 text-red-500 font-bold">
                    <HiX className="mr-2 text-lg" />
                    <span className="text-sm">Remove File</span>
                </button>
              )}
            </div>
          </div>

          <button 
            type="submit"
            className={`bg-blue-400 text-white font-bold cursor-pointer px-6 py-2 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            // onClick={handleCreatePostClick}
            disabled={isButtonDisabled}
          >
              Create Post
          </button>

          { error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

        </form>
      </div>
    )
}

export default RightHomePage