import Link from "next/link";

export const TosAndPrivacy = () => (
  <div>
    <p className={"text-xs"}>
      By enabling notifications you agree to Dialect&apos;s{" "}
      <Link target="_blank" rel="noreferrer" href="https://www.dialect.to/tos">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link target="_blank" rel="noreferrer" href="https://www.dialect.to/privacy">
        Privacy Policy
      </Link>
    </p>
  </div>
);
