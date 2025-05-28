import { SignIn, SignUp } from "@clerk/nextjs";


export default function SignUnPage() {
  return (
    <div className="flex h-screen items-center justify-center">
    <SignUp/>
    </div>
  );
}
