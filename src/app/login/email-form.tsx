import { Button } from "@/components/base/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/base/dialog";
import { Field, Label } from "@/components/base/fieldset";
import { Input } from "@/components/base/input";
import { loginWithEmail } from "@/lib/session";
import { useState } from "react";
import toast from "react-hot-toast";

interface EmailFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function EmailForm({ isOpen, setIsOpen }: EmailFormProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onClick = async () => {
    if (!email) {
      toast.error("Email is required");
    } else if (!password) {
      toast.error("Password is required");
    } else {
      const { error } = await loginWithEmail(email, password);
      if (!error) {
        setIsOpen(false);
      }
    }
  };

  return (
    <Dialog size="md" open={isOpen} onClose={setIsOpen}>
      <DialogTitle>Sign In</DialogTitle>
      <DialogDescription>
        Sign in to your account to continue.
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
        <Field className="mt-4 space-y-3">
          <Label className="text-sm/5 font-medium dark:text-zinc-950">
            Password
          </Label>
          <Input
            required
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
      </DialogBody>
      <DialogActions>
        <Button plain onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button onClick={onClick}>Sign In</Button>
      </DialogActions>
    </Dialog>
  );
}
