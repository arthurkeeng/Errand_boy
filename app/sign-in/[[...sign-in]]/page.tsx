import { SignIn } from "@clerk/nextjs";


export default function SignInPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded",
          },
        }}
      />
    </div>
  );
}