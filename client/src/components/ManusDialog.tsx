import { SignIn } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginDialogProps {
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * 로그인 다이얼로그
 *
 * Clerk의 SignIn 컴포넌트를 사용하여 로그인 UI를 표시합니다.
 * (이전 ManusDialog에서 Clerk 기반으로 마이그레이션됨)
 */
export function ManusDialog({
  title = "Sign in to continue",
  open = false,
  onOpenChange,
}: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="py-5 bg-[#f8f8f7] rounded-[20px] max-w-[450px] shadow-[0px_4px_11px_0px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.08)] backdrop-blur-2xl p-0 gap-0 text-center">
        <div className="flex flex-col items-center gap-2 p-5 pt-8">
          <DialogTitle className="text-xl font-semibold text-[#34322d] leading-[26px] tracking-[-0.44px]">
            {title}
          </DialogTitle>
        </div>

        <div className="px-5 pb-5">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "w-full",
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 하위 호환성을 위한 별칭 (Deprecated)
export const LoginDialog = ManusDialog;
