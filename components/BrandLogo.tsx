import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  label?: string;
  subtitle?: string;
};

export default function BrandLogo({
  className = "",
  imageClassName = "h-12 w-24",
  label = "FD Arcadia",
  subtitle,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="grid shrink-0 place-items-center rounded-lg border border-[var(--fd-blue)]/10 bg-white p-1.5 shadow-sm">
        <Image
          src="/brand/fdbookhub-2026-logo.png"
          alt="FDbookHUB 2026 logo"
          width={220}
          height={128}
          className={`${imageClassName} object-contain`}
        />
      </span>
      {label && (
        <span>
          <span className="block text-sm font-black leading-none text-[var(--fd-blue)]">
            {label}
          </span>
          {subtitle && (
            <span className="mt-1 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--fd-green)]">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
