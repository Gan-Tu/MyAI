import { Button } from "@/components/base/button";
import { Checkbox } from "@/components/base/checkbox";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/base/dialog";
import { ErrorMessage, Field, Label } from "@/components/base/fieldset";
import { Input } from "@/components/base/input";
import { createAccount, loginWithEmail, resetPassword } from "@/lib/session";
import { CheckIcon } from "@heroicons/react/20/solid";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface EmailFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const validatePassword = (pwd: string) => {
  if (pwd.length === 0) {
    return "";
  }
  if (pwd.length < 8) {
    return "Must be at least 8 characters long.";
  }
  if (!/[a-z]/.test(pwd)) {
    return "Must contain at least one lowercase letter.";
  }
  if (!/\d/.test(pwd)) {
    return "Must contain at least one number.";
  }
  return ""; // Valid password
};

export function EmailForm({ isOpen, setIsOpen }: EmailFormProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isCreateAccount, setIsCreateAccount] = useState<boolean>(false);
  const [pwdError, setPwdError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    if (isCreateAccount && password) {
      setPwdError(validatePassword(password));
    }
  }, [isCreateAccount, password]);

  const onClick = async () => {
    if (!email) {
      toast.error("Email is required");
    } else if (!password) {
      toast.error("Password is required");
    } else {
      const { error } = isCreateAccount
        ? await createAccount(email, password, rememberMe)
        : await loginWithEmail(email, password, rememberMe);
      if (!error) {
        setIsOpen(false);
      }
    }
  };

  const resetState = () => {
    setEmail("");
    setPassword("");
    setRememberMe(true);
    setPwdError("");
    setShowPassword(false);
  };

  const onClose = () => {
    setIsOpen(false);
    resetState();
  };

  const toggleMode = () => {
    setIsCreateAccount((x) => !x);
    resetState();
  };

  const onForgetPassword = async () => {
    if (!email) {
      toast.error("Email is required");
    } else {
      const { error } = await resetPassword(email);
      if (error) {
        toast.error(error);
      }
    }
  };

  return (
    <Dialog size="sm" open={isOpen} onClose={onClose}>
      <DialogTitle>{isCreateAccount ? "Sign Up" : "Sign In"}</DialogTitle>
      <DialogDescription>
        {isCreateAccount
          ? "Create an acconut to continue."
          : "Sign in to your account to continue."}
      </DialogDescription>
      <DialogBody>
        <Field className="space-y-3">
          <Label className="text-sm/5 font-medium dark:text-zinc-950">
            Email
          </Label>
          <Input
            required
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        {(isCreateAccount || email) && (
          <Field className="mt-4 space-y-3">
            <Label className="text-sm/5 font-medium dark:text-zinc-950">
              Password
            </Label>
            <div className="relative flex items-center">
              <Input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute right-3 h-5 w-5 cursor-pointer bg-white px-4"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="cursor-potiner h-4 w-4" />
                ) : (
                  <EyeIcon className="cursor-potiner h-4 w-4" />
                )}
              </button>
            </div>
            {pwdError && <ErrorMessage>{pwdError}</ErrorMessage>}
          </Field>
        )}
        <div className="mt-8 flex items-center justify-between text-sm/5">
          <Field className="flex items-center gap-3">
            <Checkbox
              name="remember-me"
              checked={rememberMe}
              defaultChecked={true}
              onChange={(checked) => setRememberMe(checked)}
            >
              <CheckIcon className="fill-white opacity-0 group-data-[checked]:opacity-100" />
            </Checkbox>
            <Label>Remember me</Label>
          </Field>
          {!isCreateAccount && email && (
            <span
              className="cursor-pointer font-medium hover:text-gray-600"
              onClick={onForgetPassword}
            >
              Forgot password?
            </span>
          )}
        </div>
      </DialogBody>
      {!isCreateAccount ? (
        <div className="mt-6 rounded-lg bg-gray-50 py-4 text-center text-sm/5 tracking-normal ring-1 ring-black/5">
          Not a member?{" "}
          <span
            className="cursor-pointer font-medium hover:text-gray-600"
            onClick={toggleMode}
          >
            Create an account
          </span>
        </div>
      ) : (
        <div className="mt-6 rounded-lg bg-gray-50 py-4 text-center text-sm/5 tracking-normal ring-1 ring-black/5">
          Already an member?{" "}
          <span
            className="cursor-pointer font-medium hover:text-gray-600"
            onClick={toggleMode}
          >
            Log in here.
          </span>
        </div>
      )}
      <DialogActions>
        <Button plain onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onClick}
          disabled={!email || !password || pwdError.length > 0}
        >
          {isCreateAccount ? "Sign Up" : "Sign In"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
