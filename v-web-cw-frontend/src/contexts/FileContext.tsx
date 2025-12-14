import { createContext, use, useState } from "react";

interface FileContextValue {
  file: File | null;
  setFile: (file: File | null) => void;
  clearFile: () => void
}

export const FileContext = createContext<FileContextValue | undefined>(undefined);

export const FileProvider = ({ children }: { children: any }) => {
  const [file, setFile] = useState<File | null>(null);
  const clearFile = () => setFile(null);
  return (
    <FileContext.Provider value={{ file, setFile, clearFile }}>
      {children}
    </FileContext.Provider>
  );
};

