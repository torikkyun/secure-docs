import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FileActivityLoggerModule = buildModule("FileActivityLoggerModule", (m) => {
  const fileActivityLogger = m.contract("FileActivityLogger");

  return { fileActivityLogger };
});

export default FileActivityLoggerModule;