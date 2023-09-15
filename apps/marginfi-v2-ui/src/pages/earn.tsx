import dynamic from "next/dynamic";
import React from "react";
import { PageHeader } from "~/components/PageHeader";
import { LipClientProvider } from "~/context";

const Earn = dynamic(async () => (await import("~/components/Earn")).Earn, { ssr: false });

const EarnPage = () => {
  return (
    <LipClientProvider>
      <PageHeader>earn</PageHeader>
      <Earn />
    </LipClientProvider>
  );
};

export default EarnPage;
