'use client';

import { Button } from "@/components/ui/button"
import { HomeIcon } from "lucide-react"
import type { ButtonHTMLAttributes } from "react"

interface BackToHomeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onBack: () => void
}

export default function BackToHomeButton({ onBack, className, ...props }: BackToHomeButtonProps) {
  return (
    <Button
      onClick={onBack}
      className={`bg-sky-100 text-sky-700 hover:bg-sky-200 ${className || ""}`}
      title="Back to Home"
      {...props}
    >
      <HomeIcon className="h-5 w-5" />
    </Button>
  )
}
