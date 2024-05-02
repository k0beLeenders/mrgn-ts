import { Loader } from "~/components/ui/loader";
import { Channels, NotificationTypes } from "./components";
import {
  AddressType,
  useDialectContext,
  useNotificationSubscriptions,
  useNotificationChannelDappSubscription,
  useDialectSdk,
} from "@dialectlabs/react-sdk-blockchain-solana";

export const Settings = () => {
  const { dappAddress } = useDialectContext();
  const test = useDialectSdk();

  console.log(test);

  // const subscription = useNotificationChannelDappSubscription({
  //   addressType: AddressType.Wallet,
  //   dappAddress,
  // });

  // const { isFetching: isFetchingNotificationsSubscriptions } = useNotificationSubscriptions({ dappAddress });

  // const isLoading = subscription.isFetchingSubscriptions || isFetchingNotificationsSubscriptions;

  //const { channels } = useExternalProps();

  return false ? (
    <Loader label="Loading settings..." />
  ) : (
    <div className="dt-flex dt-h-full dt-flex-col">
      <div className="dt-px-4 dt-py-3">
        <Channels channels={["wallet", "email", "telegram"]} />
      </div>
      <div className="dt-px-4">
        <NotificationTypes />
      </div>
      <div className="dt-flex-1" />
      {/* <div className={clsx("dt-flex dt-flex-col dt-gap-2 dt-px-4 dt-py-4", ClassTokens.Stroke.Primary)}>
        <TosAndPrivacy />
        <AppInfo />
      </div> */}
    </div>
  );
};
