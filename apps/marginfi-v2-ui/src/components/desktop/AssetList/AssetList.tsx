import React from "react";
import Image from "next/image";
import { getCoreRowModel, flexRender, useReactTable, SortingState, getSortedRowModel } from "@tanstack/react-table";
import { useHotkeys } from "react-hotkeys-hook";

import { ExtendedBankInfo, ActiveBankInfo } from "@mrgnlabs/marginfi-v2-ui-state";

import { useMrgnlendStore, useUserProfileStore, useUiStore } from "~/store";

import {
  LSTDialog,
  LSTDialogVariants,
  AssetListFilters,
  sortApRate,
  sortTvl,
  STABLECOINS,
  LSTS,
} from "~/components/common/AssetList";
import { LendingModes } from "~/types";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { AssetListModel, generateColumns, makeData } from "./utils";
import { AssetRow } from "./components";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { IconAlertTriangle } from "~/components/ui/icons";

export const AssetsList = () => {
  const [isStoreInitialized, extendedBankInfos, nativeSolBalance, selectedAccount] = useMrgnlendStore((state) => [
    state.initialized,
    state.extendedBankInfos,
    state.nativeSolBalance,
    state.selectedAccount,
  ]);
  const [denominationUSD, setShowBadges] = useUserProfileStore((state) => [state.denominationUSD, state.setShowBadges]);
  const [lendingMode, setLendingMode, poolFilter, isFilteredUserPositions, sortOption] = useUiStore((state) => [
    state.lendingMode,
    state.setLendingMode,
    state.poolFilter,
    state.isFilteredUserPositions,
    state.sortOption,
  ]);

  const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const [isHotkeyMode, setIsHotkeyMode] = React.useState(false);
  const [isLSTDialogOpen, setIsLSTDialogOpen] = React.useState(false);
  const [lstDialogVariant, setLSTDialogVariant] = React.useState<LSTDialogVariants | null>(null);
  const [lstDialogCallback, setLSTDialogCallback] = React.useState<(() => void) | null>(null);

  const isInLendingMode = React.useMemo(() => lendingMode === LendingModes.LEND, [lendingMode]);

  const sortBanks = React.useCallback(
    (banks: ExtendedBankInfo[]) => {
      if (sortOption.field === "APY") {
        return sortApRate(banks, isInLendingMode, sortOption.direction);
      } else if (sortOption.field === "TVL") {
        return sortTvl(banks, sortOption.direction);
      } else {
        return banks;
      }
    },
    [isInLendingMode, sortOption]
  );

  const sortedBanks = React.useMemo(() => {
    let filteredBanks = extendedBankInfos;

    if (poolFilter === "isolated") {
      filteredBanks = filteredBanks.filter((b) => b.info.state.isIsolated);
    } else if (poolFilter === "stable") {
      filteredBanks = filteredBanks.filter((b) => STABLECOINS.includes(b.meta.tokenSymbol));
    } else if (poolFilter === "lst") {
      filteredBanks = filteredBanks.filter((b) => LSTS.includes(b.meta.tokenSymbol));
    }

    if (isStoreInitialized && sortOption) {
      return sortBanks(filteredBanks);
    } else {
      return filteredBanks;
    }
  }, [isStoreInitialized, poolFilter, extendedBankInfos, sortOption, sortBanks]);

  const globalBanks = React.useMemo(() => {
    return (
      sortedBanks &&
      sortedBanks.filter((b) => !b.info.state.isIsolated).filter((b) => (isFilteredUserPositions ? b.isActive : true))
    );
  }, [isFilteredUserPositions, sortedBanks]);

  const isolatedBanks = React.useMemo(() => {
    return (
      sortedBanks &&
      sortedBanks.filter((b) => b.info.state.isIsolated).filter((b) => (isFilteredUserPositions ? b.isActive : true))
    );
  }, [sortedBanks, isFilteredUserPositions]);

  const activeBankInfos = React.useMemo(
    () => extendedBankInfos.filter((balance) => balance.isActive),
    [extendedBankInfos]
  ) as ActiveBankInfo[];

  // Enter hotkey mode
  useHotkeys(
    "meta + k",
    () => {
      setIsHotkeyMode(true);
      setShowBadges(true);

      setTimeout(() => {
        setIsHotkeyMode(false);
        setShowBadges(false);
      }, 5000);
    },
    { preventDefault: true, enableOnFormTags: true }
  );

  // Handle number keys in hotkey mode
  useHotkeys(
    extendedBankInfos
      .filter((b) => !b.info.state.isIsolated)
      .map((_, i) => `${i + 1}`)
      .join(", "),
    (_, handler) => {
      if (isHotkeyMode) {
        const globalBankTokenNames = extendedBankInfos
          .filter((b) => !b.info.state.isIsolated)
          .sort(
            (a, b) => b.info.state.totalDeposits * b.info.state.price - a.info.state.totalDeposits * a.info.state.price
          )
          .map((b) => b.meta.tokenSymbol);

        const keyPressed = handler.keys?.join("");
        if (Number(keyPressed) >= 1 && Number(keyPressed) <= globalBankTokenNames.length) {
          inputRefs.current[globalBankTokenNames[Number(keyPressed) - 1]]?.querySelector("input")!.focus();
          setIsHotkeyMode(false);
          setShowBadges(false);
        }
      }
    },
    { preventDefault: false, enableOnFormTags: true }
  );

  // Toggle lending mode in hotkey mode
  useHotkeys(
    "q",
    () => {
      if (isHotkeyMode) {
        setLendingMode(lendingMode === LendingModes.LEND ? LendingModes.BORROW : LendingModes.LEND);
        setIsHotkeyMode(false);
        setShowBadges(false);
      }
    },
    { enableOnFormTags: true }
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const globalPoolTableData = React.useMemo(() => {
    return makeData(globalBanks, isInLendingMode, denominationUSD, nativeSolBalance, selectedAccount);
  }, [globalBanks, isInLendingMode, denominationUSD, nativeSolBalance, selectedAccount]);

  const isolatedPoolTableData = React.useMemo(() => {
    const data = makeData(isolatedBanks, isInLendingMode, denominationUSD, nativeSolBalance, selectedAccount);
    return data;
  }, [isolatedBanks, isInLendingMode, denominationUSD, nativeSolBalance, selectedAccount]);

  const tableColumns = React.useMemo(() => {
    return generateColumns(isInLendingMode);
  }, [isInLendingMode]);

  const globalTable = useReactTable<AssetListModel>({
    data: globalPoolTableData,
    columns: tableColumns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  const isolatedTable = useReactTable<AssetListModel>({
    data: isolatedPoolTableData,
    columns: tableColumns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <>
      <AssetListFilters />
      <div className="col-span-full">
        {globalPoolTableData.length ? (
          <>
            <TableCaption>
              <div className="font-aeonik font-normal h-full w-full flex items-center text-2xl text-white pt-4  pb-2 gap-1">
                Global <span className="block">pool</span>
              </div>
            </TableCaption>
            <Table>
              <TableHeader>
                {globalTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {globalTable.getRowModel().rows.map((row) => (
                  <AssetRow key={row.id} {...row} />
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <></>
        )}
        {isolatedPoolTableData.length ? (
          <>
            <TableCaption>
              <div className="font-aeonik font-normal h-full w-full flex items-center text-2xl text-white pt-4 pb-2 gap-2">
                <span className="gap-1 flex">
                  Isolated <span className="hidden lg:block">pools</span>
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Image src="/info_icon.png" alt="info" height={16} width={16} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-2">
                        <h4 className="flex items-center gap-1 text-base">
                          <IconAlertTriangle /> Isolated pools are risky
                        </h4>
                        <p>
                          Assets in isolated pools cannot be used as collateral. When you borrow an isolated asset, you
                          cannot borrow other assets. Isolated pools should be considered particularly risky.
                        </p>
                        <p>
                          As always, remember that marginfi is a decentralized protocol and all deposited funds are at
                          risk.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCaption>
            <Table>
              <TableHeader>
                {isolatedTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isolatedTable.getRowModel().rows.map((row) => (
                  <AssetRow key={row.id} {...row} />
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <></>
        )}
        {/* <TableBody>
            {globalBanks.length ? (
              globalBanks.map((bank, i) => {
                if (poolFilter === "stable" && !STABLECOINS.includes(bank.meta.tokenSymbol)) return null;
                if (poolFilter === "lst" && !LSTS.includes(bank.meta.tokenSymbol)) return null;

                // check to see if bank is in open positions
                const userPosition = activeBankInfos.filter(
                  (activeBankInfo) => activeBankInfo.meta.tokenSymbol === bank.meta.tokenSymbol
                );

                if (isFilteredUserPositions && !userPosition.length) return null;

                return isStoreInitialized ? (
                  <NewAssetRow
                    key={bank.meta.tokenSymbol}
                    nativeSolBalance={nativeSolBalance}
                    bank={bank}
                    isInLendingMode={isInLendingMode}
                    isConnected={connected}
                    marginfiAccount={selectedAccount}
                    inputRefs={inputRefs}
                    hasHotkey={true}
                    showHotkeyBadges={showBadges}
                    badgeContent={`${i + 1}`}
                    activeBank={userPosition[0]}
                    showLSTDialog={(variant: LSTDialogVariants, onClose?: () => void) => {
                      setLSTDialogVariant(variant);
                      setIsLSTDialogOpen(true);
                      if (onClose) {
                        setLSTDialogCallback(() => onClose);
                      }
                    }}
                  />
                ) : (
                  <LoadingAsset
                    key={bank.meta.tokenSymbol}
                    isInLendingMode={isInLendingMode}
                    bankMetadata={bank.meta}
                  />
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="border-none">
                  <div className="font-aeonik font-normal text-lg text-input">No global banks found.</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody> */}

        {/* <TableContainer>
          {poolFilter !== "isolated" && (
            <>
              <div className="font-aeonik font-normal h-full w-full flex items-center text-2xl text-white pt-4 mt-4 pb-2 gap-1">
                Global <span className="block">pool</span>
              </div>
              <Table
                className="table-fixed"
                style={{
                  borderCollapse: "separate",
                  borderSpacing: "0px 0px",
                }}
              >
                <TableHead>
                  <AssetRowHeader isInLendingMode={isInLendingMode} isGlobalPool={true} />
                </TableHead>

                <TableBody>
                  {globalBanks.length ? (
                    globalBanks.map((bank, i) => {
                      if (poolFilter === "stable" && !STABLECOINS.includes(bank.meta.tokenSymbol)) return null;
                      if (poolFilter === "lst" && !LSTS.includes(bank.meta.tokenSymbol)) return null;

                      // check to see if bank is in open positions
                      const userPosition = activeBankInfos.filter(
                        (activeBankInfo) => activeBankInfo.meta.tokenSymbol === bank.meta.tokenSymbol
                      );

                      if (isFilteredUserPositions && !userPosition.length) return null;

                      return isStoreInitialized ? (
                        <AssetRow
                          key={bank.meta.tokenSymbol}
                          nativeSolBalance={nativeSolBalance}
                          bank={bank}
                          isInLendingMode={isInLendingMode}
                          isConnected={connected}
                          marginfiAccount={selectedAccount}
                          inputRefs={inputRefs}
                          hasHotkey={true}
                          showHotkeyBadges={showBadges}
                          badgeContent={`${i + 1}`}
                          activeBank={userPosition[0]}
                          showLSTDialog={(variant: LSTDialogVariants, onClose?: () => void) => {
                            setLSTDialogVariant(variant);
                            setIsLSTDialogOpen(true);
                            if (onClose) {
                              setLSTDialogCallback(() => onClose);
                            }
                          }}
                        />
                      ) : (
                        <LoadingAsset
                          key={bank.meta.tokenSymbol}
                          isInLendingMode={isInLendingMode}
                          bankMetadata={bank.meta}
                        />
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="border-none">
                        <div className="font-aeonik font-normal text-lg text-input">No global banks found.</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
          {poolFilter !== "stable" && poolFilter !== "lst" && (
            <>
              <div className="font-aeonik font-normal h-full w-full flex items-center text-2xl text-white pt-4 pb-2 gap-2">
                <span className="gap-1 flex">
                  Isolated <span className="hidden lg:block">pools</span>
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Image src="/info_icon.png" alt="info" height={16} width={16} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-2">
                        <h4 className="flex items-center gap-1 text-base">
                          <IconAlertTriangle /> Isolated pools are risky
                        </h4>
                        <p>
                          Assets in isolated pools cannot be used as collateral. When you borrow an isolated asset, you
                          cannot borrow other assets. Isolated pools should be considered particularly risky.
                        </p>
                        <p>
                          As always, remember that marginfi is a decentralized protocol and all deposited funds are at
                          risk.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Table className="table-fixed" style={{ borderCollapse: "separate", borderSpacing: "0px 0px" }}>
                <TableHead>
                  <AssetRowHeader isInLendingMode={isInLendingMode} isGlobalPool={false} />
                </TableHead>
                <TableBody>
                  {isolatedBanks.length ? (
                    isolatedBanks.map((bank) => {
                      const activeBank = activeBankInfos.filter(
                        (activeBankInfo) => activeBankInfo.meta.tokenSymbol === bank.meta.tokenSymbol
                      );

                      if (isFilteredUserPositions && !activeBank.length) return null;

                      return isStoreInitialized ? (
                        <AssetRow
                          key={bank.meta.tokenSymbol}
                          nativeSolBalance={nativeSolBalance}
                          bank={bank}
                          isInLendingMode={isInLendingMode}
                          isConnected={connected}
                          marginfiAccount={selectedAccount}
                          activeBank={activeBank[0]}
                          inputRefs={inputRefs}
                          hasHotkey={false}
                        />
                      ) : (
                        <LoadingAsset
                          key={bank.meta.tokenSymbol}
                          isInLendingMode={isInLendingMode}
                          bankMetadata={bank.meta}
                        />
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="border-none">
                        <div className="font-aeonik font-normal text-lg text-input">No isolated banks found.</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </TableContainer> */}
      </div>
      <LSTDialog
        variant={lstDialogVariant}
        open={isLSTDialogOpen}
        onClose={() => {
          setIsLSTDialogOpen(false);
          setLSTDialogVariant(null);
          if (lstDialogCallback) {
            lstDialogCallback();
            setLSTDialogCallback(null);
          }
        }}
      />
    </>
  );
};
