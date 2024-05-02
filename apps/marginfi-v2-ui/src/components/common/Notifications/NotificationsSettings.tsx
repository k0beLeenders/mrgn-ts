import "@dialectlabs/react-ui/index.css";

import { NotificationsButton } from "@dialectlabs/react-ui";
import { useWalletContext } from "~/hooks/useWalletContext";
import { Settings } from "./Settings/Settings";
import { ExternalPropsProvider } from "./ExternalPropsProvider";
import React from "react";
import { DialectSolanaSdk } from "@dialectlabs/react-sdk-blockchain-solana";

/* Set DAPP_ADDRESS variable to the public key generated in previous section */
const DAPP_ADDRESS = "mrGnEYJUBdszfDkHuFuBbwhvTmS6y8xuYUidg9cZekV";

export const DialectNotifications = () => {
  const { wallet } = useWalletContext();

  const normalizedExtProps = React.useMemo(
    () => ({
      channels: ["wallet", "email", "telegram"] as any,
    }),
    []
  );

  return (
    <DialectSolanaSdk
      dappAddress={DAPP_ADDRESS}
      customWalletAdapter={wallet}
      config={{
        environment: "production",
      }}
    >
      <ExternalPropsProvider props={normalizedExtProps}>
        <Settings />
      </ExternalPropsProvider>
    </DialectSolanaSdk>
  );
};
