import { Cloud, MapPin, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CoordinatePickerMap from "./CoordinatePickerMap";
import {
  getGoogleDriveConfiguration,
  prepareGoogleDrivePicker,
  selectGoogleDrivePhotos,
} from "../utils/googleDrive";

export type DrivePhotoDraft = {
  driveFileId: string;
  name: string;
  mimeType: string;
  blob: Blob;
  previewUrl: string;
  latitude: string;
  longitude: string;
  capturedAt: string | null;
  coordinateSource: "drive" | "manual" | "missing";
};

interface DrivePhotoImporterProps {
  photos: DrivePhotoDraft[];
  onChange: (photos: DrivePhotoDraft[]) => void;
  disabled?: boolean;
}

const isValidCoordinate = (value: string, min: number, max: number) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max;
};

const DrivePhotoImporter = ({
  photos,
  onChange,
  disabled = false,
}: DrivePhotoImporterProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const configuration = useMemo(() => getGoogleDriveConfiguration(), []);

  useEffect(() => {
    if (!configuration) return;
    prepareGoogleDrivePicker().catch(() => {
      setError("Google Drive could not be loaded.");
    });
  }, [configuration]);

  const activePhoto = useMemo(
    () => photos.find((photo) => photo.driveFileId === activePhotoId) ?? null,
    [activePhotoId, photos]
  );

  const activePosition = useMemo(() => {
    if (
      !activePhoto ||
      !isValidCoordinate(activePhoto.latitude, -90, 90) ||
      !isValidCoordinate(activePhoto.longitude, -180, 180)
    ) {
      return null;
    }
    return {
      lat: Number.parseFloat(activePhoto.latitude),
      lng: Number.parseFloat(activePhoto.longitude),
    };
  }, [activePhoto]);

  const updatePhoto = (
    driveFileId: string,
    updates: Partial<DrivePhotoDraft>
  ) => {
    onChange(
      photos.map((photo) =>
        photo.driveFileId === driveFileId ? { ...photo, ...updates } : photo
      )
    );
  };

  const handleChoosePhotos = async () => {
    if (!configuration) {
      setError("Google Drive needs to be connected before photos can be selected.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const remainingSlots = Math.max(0, 10 - photos.length);
      if (remainingSlots === 0) {
        setError("You can import up to 10 photos at a time.");
        return;
      }

      const selected = await selectGoogleDrivePhotos(
        configuration,
        remainingSlots
      );
      const existingIds = new Set(photos.map((photo) => photo.driveFileId));
      selected
        .filter((photo) => existingIds.has(photo.driveFileId))
        .forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      const newPhotos = selected
        .filter((photo) => !existingIds.has(photo.driveFileId))
        .map<DrivePhotoDraft>((photo) => {
          const hasCoordinates =
            photo.latitude !== null && photo.longitude !== null;
          return {
            ...photo,
            latitude: photo.latitude?.toString() ?? "",
            longitude: photo.longitude?.toString() ?? "",
            coordinateSource: hasCoordinates ? "drive" : "missing",
          };
        });

      onChange([...photos, ...newPhotos]);
      if (!activePhotoId && newPhotos[0]) {
        setActivePhotoId(newPhotos[0].driveFileId);
      }
    } catch (selectionError) {
      setError(
        selectionError instanceof Error
          ? selectionError.message
          : "The selected Drive photos could not be imported."
      );
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (driveFileId: string) => {
    const removedPhoto = photos.find(
      (photo) => photo.driveFileId === driveFileId
    );
    if (removedPhoto) URL.revokeObjectURL(removedPhoto.previewUrl);
    const remaining = photos.filter(
      (photo) => photo.driveFileId !== driveFileId
    );
    onChange(remaining);
    if (activePhotoId === driveFileId) {
      setActivePhotoId(remaining[0]?.driveFileId ?? null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-3 font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleChoosePhotos}
          disabled={disabled || loading || photos.length >= 10}
        >
          <Cloud size={18} aria-hidden="true" />
          {loading ? "Loading Drive photos..." : "Choose from Google Drive"}
        </button>
        <p className="mt-2 text-xs text-gray-500">
          Select up to 10 photos. GPS coordinates are read from each photo
          when available. Photos are optimized to WebP before upload.
        </p>
        {!configuration && (
          <p className="mt-2 text-sm text-amber-700">
            Google Drive has not been connected for this environment yet.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {photos.length > 0 && (
        <div className="space-y-3">
          {photos.map((photo) => {
            const coordinatesValid =
              isValidCoordinate(photo.latitude, -90, 90) &&
              isValidCoordinate(photo.longitude, -180, 180);

            return (
              <div
                key={photo.driveFileId}
                className={`rounded-md border p-3 ${
                  activePhotoId === photo.driveFileId
                    ? "border-ooh-yeah-pink"
                    : "border-gray-200"
                }`}
              >
                <div className="flex gap-3">
                  <img
                    src={photo.previewUrl}
                    alt=""
                    className="h-20 w-20 flex-none rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{photo.name}</p>
                    <p
                      className={`mt-1 text-xs ${
                        coordinatesValid ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      {photo.coordinateSource === "drive" && coordinatesValid
                        ? "GPS location detected"
                        : coordinatesValid
                          ? "Location added manually"
                          : "Location required"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="self-start rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                    onClick={() => removePhoto(photo.driveFileId)}
                    aria-label={`Remove ${photo.name}`}
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="text-xs font-medium text-gray-600">
                    Latitude
                    <input
                      type="number"
                      min="-90"
                      max="90"
                      step="any"
                      className="mt-1 w-full rounded border p-2 text-sm"
                      value={photo.latitude}
                      onChange={(event) =>
                        updatePhoto(photo.driveFileId, {
                          latitude: event.target.value,
                          coordinateSource: "manual",
                        })
                      }
                    />
                  </label>
                  <label className="text-xs font-medium text-gray-600">
                    Longitude
                    <input
                      type="number"
                      min="-180"
                      max="180"
                      step="any"
                      className="mt-1 w-full rounded border p-2 text-sm"
                      value={photo.longitude}
                      onChange={(event) =>
                        updatePhoto(photo.driveFileId, {
                          longitude: event.target.value,
                          coordinateSource: "manual",
                        })
                      }
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="mt-2 flex items-center gap-1 text-sm font-medium text-ooh-yeah-pink hover:underline"
                  onClick={() => setActivePhotoId(photo.driveFileId)}
                >
                  <MapPin size={15} aria-hidden="true" />
                  Set location on map
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activePhoto && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Click the map to place <span className="font-semibold">{activePhoto.name}</span>
          </p>
          <CoordinatePickerMap
            key={activePhoto.driveFileId}
            position={activePosition}
            onPick={({ lat, lng }) =>
              updatePhoto(activePhoto.driveFileId, {
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6),
                coordinateSource: "manual",
              })
            }
          />
        </div>
      )}
    </div>
  );
};

export default DrivePhotoImporter;
