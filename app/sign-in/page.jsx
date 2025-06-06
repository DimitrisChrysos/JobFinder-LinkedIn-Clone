import LoginForm from "@components/LoginForm"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@app/api/auth/[...nextauth]/route"

const SignIn = async () => {

  // Τo redirect the user to the home if they are already signed in
  const session = await getServerSession(authOptions);
  if (session?.user.admin)
    redirect("/home_admin");
  else if (session)
    redirect("/home");

  return (
    <LoginForm />
  )
}

export default SignIn