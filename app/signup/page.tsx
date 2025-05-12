import SignupForm from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-black shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4">Create an Account</h1>
        <SignupForm />
      </div>
    </div>
  );
}