import { createContext, useState} from "react";
import type { ReactNode } from "react";
export interface Result {
    filename: string;            
    artist?: string;              
    previewUrl?: string | null;    
    image?: string;               
    video?: string;
    similarity?: number;
    episode?: number | null;
    anilist?: number;
    from?: number;
    at?: number;
    to?: number;
    duration?: number;
}


interface ResultContextValue {
    results: Result[];
    setResults: (value: Result[]) => void;
    clearResults: () => void;
}

export const ResultContext = createContext<ResultContextValue | undefined>(undefined);

export const ResultProvider = ({ children }: { children: ReactNode }) => {
    
    const [results, setResults] = useState<Result[]>([]);

    const clearResults = () => setResults([]);

    return (
        <ResultContext.Provider value={{ results, setResults, clearResults }}>
            {children}
        </ResultContext.Provider>
    );
};
