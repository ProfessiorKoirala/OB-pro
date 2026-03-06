
/**
 * File System Access API Utility
 * Optimized for resilience in cross-origin environments and mobile browsers.
 */

const DB_NAME = 'ob-pro-fs-handles';
const STORE_NAME = 'handles';
let db: IDBDatabase;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(new Error("Error opening IndexedDB for file handles."));
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME);
        };
    });
}

async function setHandleInDB(key: string, handle: FileSystemDirectoryHandle): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(handle, key);
        tx.oncomplete = () => resolve();
        tx.onerror = (event) => reject(new Error(`Error storing file handle: ${event}`));
    });
}

async function getHandleFromDB(key: string): Promise<FileSystemDirectoryHandle | undefined> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(new Error(`Error retrieving file handle: ${event}`));
    });
}

export async function getDirectoryHandle(promptIfNeeded = false): Promise<FileSystemDirectoryHandle | null> {
    try {
        // 1. Check for API support
        if (!('showDirectoryPicker' in window)) {
            if (promptIfNeeded) {
                alert("Direct folder access is not supported by your mobile browser. Data will be saved in your browser's secure internal memory. You can use 'Export Data' in Settings to save backups to your files.");
            }
            return null;
        }

        // 2. Handle Cross-Origin Iframe restriction (e.g. AI Studio preview)
        if (window.self !== window.top) {
            if (promptIfNeeded) {
                alert("Security policy blocks folder selection in preview frames. To use persistent folders, please run the app in its own dedicated tab or window. For now, data will be saved securely in browser storage.");
            }
            return null;
        }

        // 3. Check for saved handle
        const savedHandle = await getHandleFromDB('dataDir');
        if (savedHandle) {
            // Only query permission, don't request it automatically unless promptIfNeeded is true
            const options = { mode: 'readwrite' as const };
            if ((await (savedHandle as any).queryPermission(options)) === 'granted') {
                return savedHandle;
            }
            
            // If we need to prompt, we can request permission here
            if (promptIfNeeded) {
                if ((await (savedHandle as any).requestPermission(options)) === 'granted') {
                    return savedHandle;
                }
            }
        }

        // 4. Request new handle from user
        if (promptIfNeeded) {
            const newHandle = await (window as any).showDirectoryPicker({
                id: 'ob-pro-data',
                mode: 'readwrite',
                startIn: 'documents'
            });

            await setHandleInDB('dataDir', newHandle);
            return newHandle;
        }

        return null;
    } catch (err) {
        const error = err as Error;
        if (error.name === 'AbortError') return null; 
        if (error.name === 'SecurityError') {
             console.warn("Folder picker blocked by Security Policy (usually cross-origin frame).");
             return null;
        }
        
        console.error("FileSystem API Error:", err);
        return null;
    }
}

export async function writeFile(dirHandle: FileSystemDirectoryHandle, fileName: string, contents: string) {
    try {
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        const writable = await (fileHandle as any).createWritable();
        await writable.write(contents);
        await writable.close();
    } catch (error) {
        console.error(`Failed to write file ${fileName}:`, error);
        throw error;
    }
}

export async function readFile(dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<string | null> {
    try {
        const fileHandle = await dirHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        return await file.text();
    } catch (error) {
        if ((error as DOMException).name === 'NotFoundError') return null;
        throw error;
    }
}
