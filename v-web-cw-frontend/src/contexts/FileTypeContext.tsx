import { createContext, useState} from "react";
import type { ReactNode } from "react";
export type FileType = 'film' | 'serial' | 'anime' | 'music';

interface FileTypeContextValue {
    fileType: FileType;
    setFileType: (type: FileType) => void;
}

const FileTypeContext = createContext<FileTypeContextValue | undefined>(undefined);

export const FileTypeProvider = ({ children }: { children: ReactNode }) => {
    const [fileType, setFileType] = useState<FileType>('film');

    return (
        <FileTypeContext.Provider value={{ fileType, setFileType }}>
            {children}
        </FileTypeContext.Provider>
    );
};

export default FileTypeContext;