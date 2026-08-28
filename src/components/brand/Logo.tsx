import lockupBlack from "@/assets/logos/wecare-lockup-black.png";
import lockupWhite from "@/assets/logos/wecare-lockup-white.png";
import markBlack from "@/assets/logos/wecare-mark-black.png";
import markWhite from "@/assets/logos/wecare-mark-white.png";
import { cn } from "@/app/components/ui/utils";

/**
 * WeCare logo — official artwork in src/assets/logos.
 *
 * `Logo`     — full lockup (mark + wordmark).  ~6:1, size it by height.
 * `LogoMark` — the square sprout mark only.
 * `inverse`  — use the white artwork on dark surfaces.
 */

export function LogoMark({
  className,
  inverse = false,
  title = "",
}: {
  className?: string;
  inverse?: boolean;
  title?: string;
}) {
  return (
    <img
      src={inverse ? markWhite : markBlack}
      alt={title}
      aria-hidden={title ? undefined : true}
      className={cn("block size-7 w-auto", className)}
    />
  );
}

export function Logo({
  className,
  markClassName,
  inverse = false,
  wordmark = true,
}: {
  className?: string;
  markClassName?: string;
  inverse?: boolean;
  wordmark?: boolean;
}) {
  if (!wordmark) {
    return (
      <LogoMark inverse={inverse} title="WeCare" className={markClassName} />
    );
  }
  return (
    <img
      src={inverse ? lockupWhite : lockupBlack}
      alt="WeCare"
      className={cn("block h-7 w-auto", className)}
    />
  );
}
