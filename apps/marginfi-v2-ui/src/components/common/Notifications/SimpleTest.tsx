import "@dialectlabs/react-ui/index.css";

import {
  AddressType,
  DialectSolanaSdk,
  Environment,
  useDialectContext,
  useDialectSdk,
  useNotificationChannelDappSubscription,
} from "@dialectlabs/react-sdk-blockchain-solana";
import { Icons, NotificationTypeStyles, NotificationsButton, ThemeType } from "@dialectlabs/react-ui";

const DAPP_ADDRESS = "mrGnEYJUBdszfDkHuFuBbwhvTmS6y8xuYUidg9cZekV";

NotificationTypeStyles.offer_outbid = {
  Icon: <Icons.Bell width={12} height={12} />,
  iconColor: "#FFFFFF",
  iconBackgroundColor: "#FF0000",
  iconBackgroundBackdropColor: "#FF00001A",
  linkColor: "#FF0000",
  actionGradientStartColor: "#FF00001A",
};

export const SimpleTest = (props: { theme: ThemeType }) => {
  return (
    <DialectSolanaSdk
      dappAddress={DAPP_ADDRESS}
      config={{
        environment: "production",
      }}
    >
      <Test2 />
    </DialectSolanaSdk>
  );
};

export const Test2 = () => {
  const { dappAddress } = useDialectContext();

  const subscription = useNotificationChannelDappSubscription({
    addressType: AddressType.Wallet,
    dappAddress,
  });

  console.log(subscription);
  return <div>hi</div>;
};
