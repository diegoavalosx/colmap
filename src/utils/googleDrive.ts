import heicDecoderWasmUrl from "@keeratita/heic-converter/wasm?url";

export type GoogleDriveConfiguration = {
  clientId: string;
  developerKey: string;
  appId: string;
};

export type GoogleDrivePhotoAsset = {
  driveFileId: string;
  name: string;
  mimeType: string;
  blob: Blob;
  previewUrl: string;
  latitude: number | null;
  longitude: number | null;
  capturedAt: string | null;
};

type PickerDocument = {
  id: string;
  name?: string;
  mimeType?: string;
};

type PickerResponse = {
  action?: string;
  docs?: PickerDocument[];
};

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
};

type GoogleTokenClient = {
  callback: (response: TokenResponse) => void;
  requestAccessToken: (options: { prompt: string }) => void;
};

type GoogleOAuthError = {
  type?: string;
};

type GooglePickerBuilder = {
  addView: (view: unknown) => GooglePickerBuilder;
  enableFeature: (feature: unknown) => GooglePickerBuilder;
  setAppId: (appId: string) => GooglePickerBuilder;
  setCallback: (callback: (response: PickerResponse) => void) => GooglePickerBuilder;
  setDeveloperKey: (key: string) => GooglePickerBuilder;
  setOAuthToken: (token: string) => GooglePickerBuilder;
  setOrigin: (origin: string) => GooglePickerBuilder;
  build: () => { setVisible: (visible: boolean) => void };
};

type GoogleDocsView = {
  setMode: (mode: unknown) => GoogleDocsView;
};

type GoogleServices = {
  accounts: {
    oauth2: {
      initTokenClient: (options: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        error_callback?: (error: GoogleOAuthError) => void;
      }) => GoogleTokenClient;
    };
  };
  picker: {
    Action: { PICKED: string; CANCEL: string };
    DocsView: new (viewId: unknown) => GoogleDocsView;
    DocsViewMode: { LIST: unknown };
    Feature: { MULTISELECT_ENABLED: unknown };
    PickerBuilder: new () => GooglePickerBuilder;
    ViewId: { DOCS_IMAGES: unknown };
  };
};

type GoogleApiLoader = {
  load: (name: string, callback: () => void) => void;
};

type GoogleWindow = Window & {
  gapi?: GoogleApiLoader;
  google?: GoogleServices;
};

type DriveFileMetadata = {
  id: string;
  name: string;
  mimeType: string;
  capabilities?: { canDownload?: boolean };
  imageMediaMetadata?: {
    location?: { latitude?: number; longitude?: number };
    time?: string;
  };
};

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const SCRIPT_TIMEOUT_MS = 15_000;
const WEB_IMAGE_MAX_DIMENSION = 2560;
const WEB_IMAGE_QUALITY = 0.84;
const HEIC_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);
const BROWSER_OPTIMIZABLE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

let cachedAccessToken: { token: string; expiresAt: number } | null = null;
let pickerLibraryPromise: Promise<void> | null = null;
let heicWasmPromise: Promise<ArrayBuffer> | null = null;

const isHeicPhoto = (name: string, mimeType: string) =>
  HEIC_MIME_TYPES.has(mimeType.toLowerCase()) || /\.hei[cf]$/i.test(name);

const webpNameFor = (name: string) =>
  /\.[^.]+$/.test(name) ? name.replace(/\.[^.]+$/, ".webp") : `${name}.webp`;

const optimizeBrowserImage = async (blob: Blob, name: string) => {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const imageElement = new Image();
      imageElement.onload = () => resolve(imageElement);
      imageElement.onerror = () =>
        reject(new Error(`${name} could not be decoded for optimization.`));
      imageElement.src = objectUrl;
    });

    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = Math.min(1, WEB_IMAGE_MAX_DIMENSION / longestSide);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image optimization is unavailable.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(new Error(`${name} could not be optimized.`)),
        "image/webp",
        WEB_IMAGE_QUALITY
      );
    });
    if (optimizedBlob.type !== "image/webp") {
      throw new Error("This browser cannot create WebP images.");
    }
    return optimizedBlob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const loadHeicWasm = async () => {
  if (!heicWasmPromise) {
    heicWasmPromise = fetch(heicDecoderWasmUrl).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Could not load the HEIC decoder (${response.status}).`);
      }
      return response.arrayBuffer();
    });
  }

  return (await heicWasmPromise).slice(0);
};

const convertHeicToWebp = async (blob: Blob, name: string) => {
  const decoderErrors: string[] = [];

  try {
    const { convertHeic, LibheifDecoder } = await import(
      "@keeratita/heic-converter"
    );
    const decoder = new LibheifDecoder({ wasmBinary: await loadHeicWasm() });
    try {
      return await convertHeic(blob, {
        to: "webp",
        quality: WEB_IMAGE_QUALITY,
        maxWidth: WEB_IMAGE_MAX_DIMENSION,
        maxHeight: WEB_IMAGE_MAX_DIMENSION,
        decoder,
      });
    } finally {
      decoder.free();
    }
  } catch (error) {
    decoderErrors.push(error instanceof Error ? error.message : String(error));
  }

  try {
    const { default: heic2any } = await import("heic2any");
    const heicBlob = new Blob([blob], { type: "image/heic" });
    const result = await heic2any({
      blob: heicBlob,
      toType: "image/jpeg",
      quality: 0.9,
    });
    const jpegBlob = Array.isArray(result) ? result[0] : result;
    if (!jpegBlob) throw new Error("No JPEG was produced.");
    return await optimizeBrowserImage(jpegBlob, name);
  } catch (error) {
    decoderErrors.push(error instanceof Error ? error.message : String(error));
    console.error(`HEIC conversion failed for ${name}`, decoderErrors);
    const detail = decoderErrors.filter(Boolean).join(" / ").slice(0, 240);
    throw new Error(
      `${name} could not be converted from HEIC to WebP.${
        detail ? ` ${detail}` : ""
      }`
    );
  }
};

export const optimizePhotoForWeb = async (
  blob: Blob,
  name: string,
  mimeType: string
) => {
  const isHeic = isHeicPhoto(name, mimeType);
  const shouldOptimize =
    isHeic || BROWSER_OPTIMIZABLE_MIME_TYPES.has(mimeType.toLowerCase());

  if (!shouldOptimize) return { blob, name, mimeType };

  const optimizedBlob = isHeic
    ? await convertHeicToWebp(blob, name)
    : await optimizeBrowserImage(blob, name);
  return {
    blob: optimizedBlob,
    name: webpNameFor(name),
    mimeType: "image/webp",
  };
};

const loadScript = (id: string, src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    const timeout = window.setTimeout(() => {
      reject(new Error("Google Drive took too long to load."));
    }, SCRIPT_TIMEOUT_MS);

    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.clearTimeout(timeout);
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Google Drive could not be loaded."));
    };

    if (!existing) document.head.appendChild(script);
  });

const loadGooglePicker = async () => {
  if (pickerLibraryPromise) return pickerLibraryPromise;

  const loadingPromise = Promise.all([
    loadScript("google-api-script", "https://apis.google.com/js/api.js"),
    loadScript("google-identity-script", "https://accounts.google.com/gsi/client"),
  ]).then(
    () =>
      new Promise<void>((resolve, reject) => {
        const googleWindow = window as unknown as GoogleWindow;
        if (!googleWindow.gapi || !googleWindow.google?.accounts) {
          reject(new Error("Google Drive did not initialize correctly."));
          return;
        }
        googleWindow.gapi.load("picker", resolve);
      })
  );

  pickerLibraryPromise = loadingPromise.catch((error) => {
    pickerLibraryPromise = null;
    throw error;
  });

  return pickerLibraryPromise;
};

const requestAccessToken = async (clientId: string) => {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const googleWindow = window as unknown as GoogleWindow;
  const oauth = googleWindow.google?.accounts.oauth2;
  if (!oauth) throw new Error("Google authorization is unavailable.");

  return new Promise<string>((resolve, reject) => {
    const tokenClient = oauth.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: () => undefined,
      error_callback: (error) => {
        if (error.type === "popup_failed_to_open") {
          reject(
            new Error(
              "Google sign-in could not open. Please allow pop-ups and try again."
            )
          );
          return;
        }
        reject(new Error("Google Drive authorization could not be opened."));
      },
    });

    tokenClient.callback = (response) => {
      if (response.error || !response.access_token) {
        reject(new Error("Google Drive authorization was not completed."));
        return;
      }

      cachedAccessToken = {
        token: response.access_token,
        expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
      };
      resolve(response.access_token);
    };

    tokenClient.requestAccessToken({ prompt: "" });
  });
};

const openPicker = (
  configuration: GoogleDriveConfiguration,
  accessToken: string
) => {
  const googleWindow = window as unknown as GoogleWindow;
  const picker = googleWindow.google?.picker;
  if (!picker) throw new Error("Google Drive Picker is unavailable.");

  return new Promise<PickerDocument[]>((resolve, reject) => {
    const imageView = new picker.DocsView(picker.ViewId.DOCS_IMAGES).setMode(
      picker.DocsViewMode.LIST
    );
    const pickerInstance = new picker.PickerBuilder()
      .addView(imageView)
      .enableFeature(picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(accessToken)
      .setDeveloperKey(configuration.developerKey)
      .setAppId(configuration.appId)
      .setOrigin(window.location.origin)
      .setCallback((response) => {
        if (response.action === picker.Action.PICKED) {
          resolve(response.docs ?? []);
        } else if (response.action === picker.Action.CANCEL) {
          resolve([]);
        }
      })
      .build();

    try {
      pickerInstance.setVisible(true);
    } catch {
      reject(new Error("Google Drive Picker could not be opened."));
    }
  });
};

const fetchDriveFile = async (file: PickerDocument, accessToken: string) => {
  const fields = encodeURIComponent(
    "id,name,mimeType,capabilities(canDownload),imageMediaMetadata(location,time)"
  );
  const metadataResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?fields=${fields}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!metadataResponse.ok) {
    throw new Error(`Could not read ${file.name ?? "a selected photo"}.`);
  }

  const metadata = (await metadataResponse.json()) as DriveFileMetadata;
  const isHeic = isHeicPhoto(metadata.name, metadata.mimeType);
  if (!metadata.mimeType.startsWith("image/") && !isHeic) {
    throw new Error(`${metadata.name} is not an image.`);
  }
  if (metadata.capabilities?.canDownload === false) {
    throw new Error(`${metadata.name} cannot be downloaded from Drive.`);
  }

  const contentResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!contentResponse.ok) {
    throw new Error(`Could not download ${metadata.name}.`);
  }

  const downloadedBlob = await contentResponse.blob();
  const processedPhoto = await optimizePhotoForWeb(
    downloadedBlob,
    metadata.name,
    metadata.mimeType
  );
  const location = metadata.imageMediaMetadata?.location;

  return {
    driveFileId: metadata.id,
    ...processedPhoto,
    previewUrl: URL.createObjectURL(processedPhoto.blob),
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    capturedAt: metadata.imageMediaMetadata?.time ?? null,
  } satisfies GoogleDrivePhotoAsset;
};

export const getGoogleDriveConfiguration = (): GoogleDriveConfiguration | null => {
  const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID?.trim();
  const developerKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY?.trim();
  const appId = import.meta.env.VITE_GOOGLE_DRIVE_APP_ID?.trim();

  if (!clientId || !developerKey || !appId) return null;
  return { clientId, developerKey, appId };
};

export const prepareGoogleDrivePicker = () => loadGooglePicker();

export const selectGoogleDrivePhotos = async (
  configuration: GoogleDriveConfiguration,
  maxFiles: number
) => {
  // Keep this call before the first await so mobile browsers recognize the
  // OAuth popup as a direct result of the user's tap.
  const accessTokenRequest = requestAccessToken(configuration.clientId);
  const accessToken = await accessTokenRequest;
  const selectedFiles = await openPicker(configuration, accessToken);
  const limitedFiles = selectedFiles.slice(0, maxFiles);
  const photos: GoogleDrivePhotoAsset[] = [];
  for (const file of limitedFiles) {
    photos.push(await fetchDriveFile(file, accessToken));
  }
  return photos;
};
