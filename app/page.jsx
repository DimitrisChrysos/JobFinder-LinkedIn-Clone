import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@app/api/auth/[...nextauth]/route"

const Home = async () => {
  // Get the user's session
  const session = await getServerSession(authOptions);
  
  // to redirect the user to the home if they are already signed in
  if (session?.user.admin)
    redirect("/home_admin");
  else if (session)
    redirect("/home");

  return (
    <section className="w-full flex-center flex-col">
        <h1 className="mt-40 text-5xl font-extrabold leading-[1.15] text-black sm:text-6xl;">
            Welcome to MyLinkedIn clone!
        </h1>
    </section>
  )
}

export default Home