import React, { ReactNode } from "react";
import InfoIcon from "@mui/icons-material/Info";

export const InformationMessage: React.FC<{ message: ReactNode; iconSize?: number; className?: string }> = ({
  message,
  iconSize = 20,
  className,
}) => {
  return (
    <div
      className={`md:px-6 mt-1 flex items-center text-xs fill-current text-black/50 dark:text-white font-semibold ${className}`}
    >
      <InfoIcon width={iconSize} height={iconSize} />
      <span className="ml-2">{message}</span>
    </div>
  );
};
