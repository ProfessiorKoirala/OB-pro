import { AppDataBackup } from "./types";

// Using the Desktop/Installed App client ID for the loopback redirect flow needed for an .exe file.
export const GOOGLE_CLIENT_ID = '536889580517-khp1pod4m36o47pbnfej97lhht3obon7.apps.googleusercontent.com';

// --- SCOPES ---
// drive.file: Per-file access to files created or opened by the app. The user can see these files in their Drive.
// userinfo.email: To get the user's email address.
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const USERINFO_SCOPES = 'https://www.googleapis.com/auth/userinfo.email';
export const COMBINED_SCOPES = `${DRIVE_SCOPE} ${USERINFO_SCOPES}`;
const DATA_FILE_NAME = 'mynagerData.json';

// Exported constant to identify token expiration errors throughout the app.
export const GAPI_TOKEN_EXPIRED_ERROR = 'TOKEN_EXPIRED';

function parseApiError(err: any): string {
    if (err?.result?.error?.message) return err.result.error.message;
    if (err?.error?.message) return err.error.message;
    if (err?.message) return err.message;
    if (typeof err === 'string') return err;
    try {
        return JSON.stringify(err);
    } catch {
        return 'An unknown API error occurred.';
    }
}

/**
 * A wrapper around fetch that checks for 401 Unauthorized errors, indicating an expired token.
 * @param url - The URL to fetch.
 * @param options - The request options.
 */
async function authorizedFetch(url: string, options: RequestInit): Promise<Response> {
    const response = await fetch(url, options);
    if (response.status === 401) {
        // When the token expires, Google API returns a 401.
        throw new Error(GAPI_TOKEN_EXPIRED_ERROR);
    }
    return response;
}


/**
 * Finds the ID of 'mynagerData.json' in the user's Google Drive.
 * The 'drive.file' scope limits this search to only files created or opened by this app.
 * @param accessToken - The OAuth2 access token.
 */
async function getDriveFileId(accessToken: string): Promise<string | null> {
    try {
        if (!accessToken) {
            throw new Error("Authentication token is not available.");
        }
        
        // Search for files named DATA_FILE_NAME that are not trashed.
        const response = await authorizedFetch(`https://www.googleapis.com/drive/v3/files?q=name='${DATA_FILE_NAME}' and trashed=false&fields=files(id,name)`, {
            headers: new Headers({ 'Authorization': `Bearer ${accessToken}` }),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw data;
        }
        
        const file = data.files.length > 0 ? data.files[0] : null;
        return file ? file.id : null;
    } catch (err: any) {
        if (err.message === GAPI_TOKEN_EXPIRED_ERROR) throw err; // Re-throw the specific error
        const message = parseApiError(err);
        console.error("Error finding app data file in Drive:", message, err);
        throw new Error(`Could not access Google Drive: ${message}`);
    }
}

/**
 * Loads and parses 'mynagerData.json' from Google Drive.
 * @param accessToken - The OAuth2 access token.
 */
export async function loadDataFromDrive(accessToken: string): Promise<AppDataBackup | null> {
    const fileId = await getDriveFileId(accessToken);

    if (!fileId) {
        console.log("⚠️ No saved file found in Drive. Will start with initial data.");
        // No alert here to avoid being intrusive on first login.
        return null;
    }

    try {
        const response = await authorizedFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: new Headers({ 'Authorization': `Bearer ${accessToken}` }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw data;
        }
        
        console.log("📂 Data loaded successfully from Google Drive.");
        alert("📂 Data loaded successfully from Google Drive!");
        return data;
    } catch (err: any) {
        if (err.message === GAPI_TOKEN_EXPIRED_ERROR) throw err; // Re-throw
        const message = parseApiError(err);
        console.error("Error loading data from Drive:", message, err);
        throw new Error(`❌ Failed to load data from Drive: ${message}`);
    }
}

/**
 * Saves the app data to 'mynagerData.json' in the user's Google Drive.
 * Creates the file if it doesn't exist, otherwise updates it.
 * @param accessToken - The OAuth2 access token.
 * @param data - The application data to save.
 */
export async function saveDataToDrive(accessToken: string, data: AppDataBackup) {
    try {
        const fileId = await getDriveFileId(accessToken);
        const content = JSON.stringify(data);
        const blob = new Blob([content], { type: 'application/json' });
        
        const metadata = {
            name: DATA_FILE_NAME,
            mimeType: 'application/json',
        };
        const formData = new FormData();
        
        let url: string;
        let method: 'POST' | 'PATCH';

        if (fileId) { // Update existing file
            url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
            method = 'PATCH';
            formData.append('metadata', new Blob([JSON.stringify({ mimeType: 'application/json' })], { type: 'application/json' }));
        } else { // Create new file
            url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id`;
            method = 'POST';
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        }
        
        formData.append('file', blob);

        const response = await authorizedFetch(url, {
            method: method,
            headers: new Headers({ 'Authorization': `Bearer ${accessToken}` }),
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw errorBody;
        }

        console.log(`✅ Data saved to Google Drive`);
    } catch (err: any) {
        if (err.message === GAPI_TOKEN_EXPIRED_ERROR) throw err; // Re-throw
        const message = parseApiError(err);
        console.error("Error saving data to Drive:", message, err);
        alert(`❌ Failed to save data to Drive: ${message}`);
        throw new Error(`Failed to save to Google Drive: ${message}`);
    }
}