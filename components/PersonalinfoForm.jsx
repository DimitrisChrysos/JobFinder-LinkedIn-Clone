"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const PersonalInfoForm = ({ user }) => {

  const [error, setError] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  const [newJobPos, setNewJobPos] = useState(user?.job_position);
  const [newEmploymentAgency, setNewEmploymentAgency] = useState(user?.employment_agency);
  const [newExperience, setNewExperience] = useState(user?.experience);
  const [newEducation, setNewEducation] = useState(user?.education);
  const [newSkills, setNewSkills] = useState(user?.skills);
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState(false);
  const [publicJobPos, setPublicJobPos] = useState(false);
  const [publicEmploymentAgency, setPublicEmploymentAgency] = useState(false);
  const [publicExperience, setPublicExperience] = useState(false);
  const [publicEducation, setPublicEducation] = useState(false);
  const [publicSkills, setPublicSkills] = useState(false);


  const getCheckedFields = async () => {
    try {
      const res = await fetch(`/api/profile/publicInfo?userId=${user._id}`);
      if (!res.ok) {
          throw new Error('Failed fetch publicInfo');
      }
      const data = await res.json();
      const publicInfo = data.publicInfo;
      
      if (publicInfo.includes('Job Position'))
        setPublicJobPos(!publicJobPos);
      if (publicInfo.includes('Employment Agency'))
        setPublicEmploymentAgency(!publicEmploymentAgency);
      if (publicInfo.includes('Experience'))
        setPublicExperience(!publicExperience);
      if (publicInfo.includes('Education'))
        setPublicEducation(!publicEducation);
      if (publicInfo.includes('Skills'))
        setPublicSkills(!publicSkills);
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const handleCheckboxChange = async (text) => {
    setIsCheckboxDisabled(true);

    try {
      const res = await fetch(`/api/profile/publicInfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({userId: user._id, category: text})
      });

    } catch (error) {
      console.log(error);
    } finally {
      setIsCheckboxDisabled(false);
      getCheckedFields(text);
    }
  };

  // Function to handle the form submission
  const handleSubmit = async (e) => {

    // Prevents the page from refreshing
    e.preventDefault();

    try {

      updateProfile();
    } catch (error) {
      console.log(error);
    }
  }

  const updateProfile = async () => {
    try {
      // Fetch request to update the user's profile
      const res = await fetch(`/api/profile_info/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({newJobPos, newEmploymentAgency, newExperience, newEducation, newSkills})
      });

      if (!res.ok) {
        throw new Error("Failed to update user data");
      }
      else {
        // Redirect to the home
        if (!session?.user.admin) {
          router.push('/home');
        } else {
          router.push('/home_admin');
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getCheckedFields();
  }, [user._id, isCheckboxDisabled]);

  return (
    <div className="grid place-items-center h-screen mt-10">
        <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
            <h1 className="text-xl font-bold my-4">
                <span className="text-3xl">Edit Personal Info</span>
                <br />
                <span className="text-gray-400 font-normal text-base">* Check only the fields you want to make available to the public</span>
                <br />
                <span className="text-gray-400 font-normal text-base">* Change only the fields you want to update</span>
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col">
                    <label htmlFor="jobPosition" className="font-semibold mb-1">Job Position</label>
                    <div className="flex items-center gap-2">
                      <input onChange={e => setNewJobPos(e.target.value)} value={newJobPos} type="text" placeholder="eg: Engineer" />
                      <div className="mx-auto flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox w-5 h-5"
                          checked={publicJobPos === true} 
                          onChange={() => handleCheckboxChange("Job Position")}
                          disabled={isCheckboxDisabled} 
                        />
                      </div>
                    </div>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="employmentAgency" className="font-semibold mb-1">Employment Agency</label>
                    <div className="flex items-center gap-2">
                      <input onChange={e => setNewEmploymentAgency(e.target.value)} value={newEmploymentAgency} type="text" placeholder="eg: Google" />
                      <div className="mx-auto flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox w-5 h-5"
                          checked={publicEmploymentAgency} 
                          onChange={() => handleCheckboxChange("Employment Agency")}
                          disabled={isCheckboxDisabled} 
                        />
                      </div>
                    </div>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="experience" className="font-semibold mb-1">Experience</label>
                    <div className="flex items-center gap-2">
                      <input onChange={e => setNewExperience(e.target.value)} value={newExperience} type="text" placeholder="eg: 4 years" />
                      <div className="mx-auto flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox w-5 h-5"
                          checked={publicExperience} 
                          onChange={() => handleCheckboxChange("Experience")}
                          disabled={isCheckboxDisabled} 
                        />
                      </div>
                    </div>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="education" className="font-semibold mb-1">Education</label>
                    <div className="flex items-center gap-2">
                      <input onChange={e => setNewEducation(e.target.value)} value={newEducation} type="text" placeholder="eg: University" />
                      <div className="mx-auto flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox w-5 h-5"
                          checked={publicEducation} 
                          onChange={() => handleCheckboxChange("Education")}
                          disabled={isCheckboxDisabled} 
                        />
                      </div>
                    </div>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="skills" className="font-semibold mb-1">Skills</label>
                    <div className="flex items-center gap-2">
                      <input onChange={e => setNewSkills(e.target.value)} value={newSkills} type="text" placeholder="eg: Hard-Working, Leadership, Team-Work" />
                      <div className="mx-auto flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox w-5 h-5"
                          checked={publicSkills} 
                          onChange={() => handleCheckboxChange("Skills")}
                          disabled={isCheckboxDisabled} 
                        />
                      </div>
                    </div>
                </div>

                <button className="bg-green-400 text-white border border-green-400 hover:bg-white hover:text-green-400 font-bold cursor-pointer px-6 py-2">
                    Update Profile
                </button>

                { error && (
                    <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
                        {error}
                    </div>
                )}

            </form>
        </div>
    </div>
  )
}

export default PersonalInfoForm