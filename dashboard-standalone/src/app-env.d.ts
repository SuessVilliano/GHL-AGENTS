/// <reference types="vite/client" />

interface Window {
    aistudio?: {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    };
}

// Shim for chrome namespace in web environment
declare namespace chrome {
    export namespace storage {
        export const local: {
            get: (keys: string[] | string | null) => Promise<any>;
            set: (items: any) => Promise<void>;
            remove: (keys: string[] | string) => Promise<void>;
        };
        export const onChanged: {
            addListener: (callback: (changes: any, areaName: string) => void) => void;
            removeListener: (callback: (changes: any, areaName: string) => void) => void;
        };
    }
}
