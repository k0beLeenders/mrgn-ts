import { AddressType, useNotificationChannel, useNotificationChannelDappSubscription } from "@dialectlabs/react-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ChannelNotificationsToggle } from "../ChannelNotificationsToggle";
import { Loader } from "~/components/ui/loader";
import { IconLoader, IconTrash, IconX } from "~/components/ui/icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const EMAIL_REGEX = new RegExp("^\\S+@\\S+\\.\\S+$");

export const EmailInput = ({ dappAddress }: { dappAddress: string }) => {
  const {
    globalAddress: emailAddress,
    create: createAddress,
    delete: deleteAddress,
    update: updateAddress,

    isCreatingAddress,
    isUpdatingAddress,
    isDeletingAddress,
    isSendingCode,
    isVerifyingCode,

    errorFetching: errorFetchingAddresses,
  } = useNotificationChannel({ addressType: AddressType.Email });

  const {
    enabled: subscriptionEnabled,
    toggleSubscription,
    isToggling,
  } = useNotificationChannelDappSubscription({
    addressType: AddressType.Email,
    dappAddress,
  });

  const [email, setEmail] = useState(emailAddress?.value || "");
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email), [email]);
  const isEmailEmpty = useMemo(() => !email, [email]);

  //for actually showing error
  const [validationError, setValidationError] = useState(false);

  //for removing error as soon as it is fixed
  useEffect(() => {
    if (isEmailEmpty || isEmailValid) {
      setValidationError(false);
    }
  }, [isEmailEmpty, isEmailValid]);

  const [error, setError] = useState<Error | null>(null);
  const [isUserDeleting, setIsUserDeleting] = useState(false);

  const isEmailSaved = Boolean(emailAddress);
  const isVerified = Boolean(emailAddress?.verified);
  const isLoading =
    isCreatingAddress || isUpdatingAddress || isDeletingAddress || isSendingCode || isVerifyingCode || isToggling;

  const currentError = error || errorFetchingAddresses;

  const updateEmail = useCallback(async () => {
    {
      try {
        await updateAddress({ value: email });
        setError(null);
      } catch (e) {
        setError(e as Error);
      }
    }
  }, [email, updateAddress]);

  const saveEmail = useCallback(async () => {
    {
      try {
        const address = await createAddress({ value: email });
        await toggleSubscription({ enabled: true, address });
        setError(null);
      } catch (e) {
        setError(e as Error);
      }
    }
  }, [createAddress, email, toggleSubscription]);

  const deleteEmail = useCallback(async () => {
    try {
      await deleteAddress();
      setEmail("");
      setIsUserDeleting(false);
      setError(null);
    } catch (e) {
      setError(e as Error);
    }
  }, [deleteAddress]);

  const toggleEmail = async (nextValue: boolean) => {
    try {
      await toggleSubscription({
        enabled: nextValue,
      });
      setError(null);
    } catch (e) {
      setError(e as Error);
    }
  };

  const isUserEditing = emailAddress?.value !== email && isEmailSaved;

  const getButton = useCallback(() => {
    if (isEmailEmpty) return null;
    if (isLoading) {
      return (
        <div className="p-2">
          <IconLoader />
        </div>
      );
    }
    if (isUserDeleting) {
      return (
        <Button onClick={deleteEmail} variant={"destructive"}>
          Delete
        </Button>
      );
    }
    if (isUserEditing) {
      return (
        <Button
          onClick={() => {
            if (!isEmailValid) {
              setValidationError(true);
            } else {
              updateEmail();
            }
          }}
          disabled={!isEmailValid}
        >
          Submit
        </Button>
      );
    }
    if (isVerified) {
      return <IconTrash className="p-2 cursor-pointer" onClick={() => setIsUserDeleting(true)} />;
    }

    return (
      <Button
        onClick={() => {
          if (!isEmailValid) {
            setValidationError(true);
          } else {
            saveEmail();
          }
        }}
        disabled={!isEmailValid}
      >
        Submit
      </Button>
    );
  }, [
    deleteEmail,
    isEmailEmpty,
    isEmailValid,
    isLoading,
    isUserDeleting,
    isUserEditing,
    isVerified,
    saveEmail,
    updateEmail,
  ]);

  return (
    <div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="settings-email">Email</Label>
        <Input
          placeholder="Enter your Email"
          id="settings-email"
          value={email}
          //error={validationError}
          disabled={isLoading || isUserDeleting}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          onBlur={() => setValidationError(!isEmailEmpty && !isEmailValid)}
          //rightAdornment={getButton()}
        />
      </div>

      {isEmailSaved && isVerified && !isUserEditing && !isUserDeleting && (
        <div className="mt-2">
          <ChannelNotificationsToggle enabled={subscriptionEnabled} onChange={toggleEmail} />
        </div>
      )}

      {validationError && <p className={"mt-2 text-destructive-foreground"}>Please enter a valid Email</p>}

      {currentError && <p className={"mt-2 text-destructive-foreground"}>{currentError.message}</p>}

      {isUserDeleting && (
        <div className="dt-mt-2 dt-flex dt-flex-col dt-gap-2">
          <p className={"text-muted-foreground"}>
            Deleting your email here will delete it across all dapps you’ve signed up.
          </p>
          <Button variant={"outline"} disabled={isLoading} onClick={() => setIsUserDeleting(false)}>
            <IconX height={12} width={12} />
            Cancel
          </Button>
        </div>
      )}

      {isUserEditing && (
        <div className="dt-mt-2 dt-flex dt-flex-col dt-gap-2">
          <p className="text-muted-foreground">
            Updating your email here will update it across all dapps you’ve signed up.
          </p>
          <Button
            variant={"outline"}
            disabled={isLoading}
            onClick={() => {
              setEmail(emailAddress?.value || "");
            }}
          >
            <IconX height={12} width={12} />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
