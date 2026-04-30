"use client";

import { useFormStatus } from "react-dom";

interface TitanSubmitButtonProps {
  idleLabel?: string;
  pendingLabel: string;
  className: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function TitanSubmitButton({
  idleLabel,
  pendingLabel,
  className,
  disabled = false,
  children,
}: TitanSubmitButtonProps): React.JSX.Element {
  const { pending } = useFormStatus();
  const blocked = disabled || pending;

  return (
    <button
      type="submit"
      disabled={blocked}
      aria-busy={pending}
      className={`${className} ${blocked ? "cursor-not-allowed opacity-70" : ""}`}
    >
      {pending ? pendingLabel : children ?? idleLabel}
    </button>
  );
}
