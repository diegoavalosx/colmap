import {
  collection,
  doc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type FirebaseStorage,
  type StorageReference,
} from "firebase/storage";
import {
  groupPhotosByLocation,
  type PhotoWithCoordinates,
} from "./locationGrouping";

export type UploadableLocationPhoto = PhotoWithCoordinates & {
  id: string;
  name: string;
  driveFileId?: string;
};

type PreparedPhoto = {
  blob: Blob;
  name: string;
  mimeType: string;
};

type SaveGroupedLocationsOptions<T extends UploadableLocationPhoto> = {
  dataBase: Firestore;
  storage: FirebaseStorage;
  campaignId: string;
  photos: T[];
  source: "device" | "google-drive";
  preparePhoto: (photo: T) => Promise<PreparedPhoto>;
  onProgress?: (message: string) => void;
};

const safeStorageName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);

const uniqueUploadId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const saveGroupedPhotoLocations = async <
  T extends UploadableLocationPhoto,
>({
  dataBase,
  storage,
  campaignId,
  photos,
  source,
  preparePhoto,
  onProgress,
}: SaveGroupedLocationsOptions<T>) => {
  const { groups, unlocated } = groupPhotosByLocation(photos);
  if (unlocated.length > 0) {
    throw new Error("Every photo needs a valid location before uploading.");
  }

  const locationCollection = collection(
    dataBase,
    `campaigns/${campaignId}/locations`
  );
  const uploadedReferences: StorageReference[] = [];
  const pendingLocations: Array<{
    locationDocument: ReturnType<typeof doc>;
    data: Record<string, unknown>;
  }> = [];
  let completedPhotos = 0;

  try {
    for (const group of groups) {
      const locationDocument = doc(locationCollection);
      const imageUrls: string[] = [];
      const driveFileIds: string[] = [];

      for (const photo of group.photos) {
        onProgress?.(`Optimizing photo ${completedPhotos + 1} of ${photos.length}…`);
        const preparedPhoto = await preparePhoto(photo);
        const storageReference = ref(
          storage,
          `campaigns/${campaignId}/locations/${locationDocument.id}_${uniqueUploadId()}_${safeStorageName(preparedPhoto.name)}`
        );

        onProgress?.(`Uploading photo ${completedPhotos + 1} of ${photos.length}…`);
        await uploadBytes(storageReference, preparedPhoto.blob, {
          contentType: preparedPhoto.mimeType,
        });
        uploadedReferences.push(storageReference);
        imageUrls.push(await getDownloadURL(storageReference));
        if (photo.driveFileId) driveFileIds.push(photo.driveFileId);
        completedPhotos += 1;
      }

      pendingLocations.push({
        locationDocument,
        data: {
          latitude: group.latitude.toFixed(6),
          longitude: group.longitude.toFixed(6),
          imageUrls,
          ...(driveFileIds.length > 0 ? { driveFileIds } : {}),
          source,
          createdAt: new Date(),
        },
      });
    }

    onProgress?.(`Saving ${groups.length} location${groups.length === 1 ? "" : "s"}…`);
    const batch = writeBatch(dataBase);
    pendingLocations.forEach(({ locationDocument, data }) =>
      batch.set(locationDocument, data)
    );
    await batch.commit();

    return { locationCount: groups.length, photoCount: photos.length };
  } catch (error) {
    await Promise.allSettled(
      uploadedReferences.map((storageReference) => deleteObject(storageReference))
    );
    throw error;
  }
};
