import { AddressType } from "@dialectlabs/react-sdk";
import clsx from "clsx";
import { useMemo } from "react";

import { useVerificationCode } from "../model/useVerificationCode";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { IconRefresh, IconX } from "~/components/ui/icons";
import { Button } from "~/components/ui/button";

const VERIFICATION_CODE_REGEX = new RegExp("^[0-9]{6}$");
export const EmailVerificationCodeInput = ({ email }: { email: string }) => {
  const {
    verificationCode,
    setVerificationCode,
    sendCode,
    resendCode,
    isSendingCode,
    isResendingCode,
    deleteAddress,
    currentError,
  } = useVerificationCode(AddressType.Email);

  const isCodeValid = useMemo(() => VERIFICATION_CODE_REGEX.test(verificationCode), [verificationCode]);
  const isLoading = isSendingCode || isResendingCode;

  return (
    <div>
      {" "}
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="settings-verification-code-emai">Email</Label>
        <Input
          id="settings-verification-code-email"
          placeholder="Enter verification code"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          /*rightAdornment={
            isLoading ? (
              <div className={clsx(ClassTokens.Icon.Tertiary, "dt-p-2")}>
                <Icons.Loader />
              </div>
            ) : (
              <Button onClick={isCodeValid ? sendCode : undefined} disabled={!isCodeValid}>
                Submit
              </Button>
            )
          }*/
        />
      </div>
      {currentError && <p className={"mt-2 text-destructive-foreground"}>{currentError.message}</p>}
      <div className="dt-mt-2 dt-flex dt-flex-col dt-gap-2">
        <p className="text-muted-foreground">
          Check your <span>{email} </span>
          inbox for a verification code.
        </p>
        <div className="dt-flex dt-flex-row dt-items-center dt-gap-8">
          <Button variant={"outline"} onClick={deleteAddress} disabled={isLoading}>
            <IconX height={12} width={12} />
            Cancel
          </Button>
          <Button onClick={resendCode} disabled={isLoading}>
            <IconRefresh height={12} width={12} />
            Resend Code
          </Button>
        </div>
      </div>
    </div>
  );
};
