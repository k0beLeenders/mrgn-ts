import {
  AddressType,
  ThreadMemberScope,
  useDialectContext,
  useDialectSdk,
  useNotificationChannel,
  useNotificationChannelDappSubscription,
  useNotificationThread,
  useUnreadNotifications,
} from "@dialectlabs/react-sdk";
import { useCallback } from "react";
import { ChannelNotificationsToggle } from "./ChannelNotificationsToggle";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { shortenAddress } from "@mrgnlabs/mrgn-common";
import { Button } from "~/components/ui/button";
import { IconTrash } from "@tabler/icons-react";
import { IconLoader } from "~/components/ui/icons";

const ADDRESS_TYPE = AddressType.Wallet;

export const WalletChannel = () => {
  const { dappAddress } = useDialectContext();
  const {
    wallet: { address: walletAddress },
  } = useDialectSdk();

  const {
    thread,
    create: createThread,
    isCreatingThread,
    delete: deleteThread,
    isDeletingThread,
  } = useNotificationThread();

  const { refresh: refreshUnreadNotifications } = useUnreadNotifications({
    revalidateOnMount: false,
  });

  const {
    globalAddress: walletSubscriptionAddress,
    create: createAddress,
    delete: deleteAddress,
    isCreatingAddress,
    isDeletingAddress,
  } = useNotificationChannel({ addressType: ADDRESS_TYPE });

  const {
    enabled: subscriptionEnabled,
    toggleSubscription,
    isToggling,
  } = useNotificationChannelDappSubscription({
    addressType: ADDRESS_TYPE,
    dappAddress,
  });

  const deleteWalletThread = useCallback(async () => {
    await deleteThread();
    await deleteAddress();
  }, [deleteAddress, deleteThread]);

  const createWalletThread = useCallback(async () => {
    if (!dappAddress) return;
    return createThread({
      me: { scopes: [ThreadMemberScope.ADMIN] },
      otherMembers: [{ address: dappAddress, scopes: [ThreadMemberScope.WRITE] }],
      encrypted: false,
    });
  }, [createThread, dappAddress]);

  const createWalletAddress = useCallback(
    () => createAddress({ value: walletAddress }),
    [createAddress, walletAddress]
  );

  const isLoading = isDeletingThread || isCreatingThread || isDeletingAddress || isCreatingAddress || isToggling;

  const setUpWallet = useCallback(async () => {
    if (isLoading) return;
    const noSubscription = !walletSubscriptionAddress && !thread;
    let notificationsThread;
    if (!thread) {
      notificationsThread = await createWalletThread();
      refreshUnreadNotifications();
    }
    let walletAddress;
    if (!walletSubscriptionAddress) {
      walletAddress = await createWalletAddress();
    }
    if (noSubscription && notificationsThread) {
      await toggleSubscription({ enabled: true, address: walletAddress });
    }
  }, [
    createWalletAddress,
    createWalletThread,
    isLoading,
    refreshUnreadNotifications,
    thread,
    toggleSubscription,
    walletSubscriptionAddress,
  ]);

  const isWalletSetUp = thread && walletSubscriptionAddress;
  const RightAdornment = useCallback(() => {
    if (isLoading)
      return (
        <div className="dt-p-2">
          <IconLoader />
        </div>
      );
    if (isWalletSetUp) return <IconTrash className={"dt-p-2 cursor-pointer"} onClick={deleteWalletThread} />;
    return <Button onClick={setUpWallet}>Enable</Button>;
  }, [deleteWalletThread, isLoading, isWalletSetUp, setUpWallet]);

  // console.log(isWalletSetUp);

  return (
    <div className="dt-flex dt-flex-col dt-gap-2">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="settings-app">In App</Label>
        <Input
          id="settings-app"
          disabled
          value={shortenAddress(walletAddress)}
          //rightAdornment={<RightAdornment />}
        />
      </div>

      {isWalletSetUp && (
        <ChannelNotificationsToggle
          enabled={subscriptionEnabled}
          onChange={(newValue: boolean) => {
            if (isToggling) return;
            return toggleSubscription({ enabled: newValue });
          }}
        />
      )}
    </div>
  );
};
