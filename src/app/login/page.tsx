import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login",
  description: "Sign in to your account to continue.",
};

export default function Login() {
  return (
    <div className="flex h-dvh content-center">
      <div className="mx-auto my-auto w-96 rounded-xl bg-white shadow-md ring-1 ring-black/5">
        <LoginForm />
      </div>
    </div>
  );
}
