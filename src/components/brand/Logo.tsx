import lockupBlack from "@/assets/logos/wecare-lockup-black.png";
import lockupWhite from "@/assets/logos/wecare-lockup-white.png";
import markBlack from "@/assets/logos/wecare-mark-black.png";
import markWhite from "@/assets/logos/wecare-mark-white.png";
import { cn } from "@/app/components/ui/utils";
import { useTheme } from "@/theme/useTheme";

/**
 * WeCare logo — official artwork in src/assets/logos.
 *
 * `Logo`     — full lockup (mark + wordmark).  ~6:1, size it by height.
 * `LogoMark` — the square sprout mark only.
 * `inverse`  — force the white artwork (dark surfaces in light mode, e.g. the
 *              footer). The white artwork is also used automatically whenever
 *              the dark appearance is active.
 */

function useWhiteArtwork(inverse: boolean): boolean {
  const { theme } = useTheme();
  return inverse || theme === "dark";
}

export function LogoMark({
  className,
  inverse = false,
  title = "",
}: {
  className?: string;
  inverse?: boolean;
  title?: string;
}) {
  const white = useWhiteArtwork(inverse);
  return (
    <img
      src={white ? markWhite : markBlack}
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
  const white = useWhiteArtwork(inverse);
  if (!wordmark) {
    return (
      <LogoMark inverse={inverse} title="WeCare" className={markClassName} />
    );
  }
  return (
    <img
      src={white ? lockupWhite : lockupBlack}
      alt="WeCare"
      className={cn("block h-7 w-auto", className)}
    />
  );
}
