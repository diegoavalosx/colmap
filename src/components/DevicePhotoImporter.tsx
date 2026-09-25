import { ImagePlus, MapPin, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { extractPhotoCoordinates } from "../utils/photoMetadata";
import {
  groupPhotosByLocation,
  hasValidPhotoCoordinates,
} from "../utils/locationGrouping";
import CoordinatePickerMap from "./CoordinatePickerMap";

export type DevicePhotoDraft = {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  latitude: string;
  longitude: string;
  coordinateSource: "metadata" | "manual" | "missing";
};

type DevicePhotoImporterProps = {
  photos: DevicePhotoDraft[];
  onChange: (photos: DevicePhotoDraft[]) => void;
  disabled?: boolean;
};

const uniquePhotoId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const DevicePhotoImporter = ({
  photos,
  onChange,
  disabled = false,
}: DevicePhotoImporterProps) => {
  const [readingMetadata, setReadingMetadata] = useState(false);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { groups, unlocated } = useMemo(
    () => groupPhotosByLocation(photos),
    [photos]
  );
  const activePhoto = useMemo(
    () => photos.find((photo) => photo.id === activePhotoId) ?? null,
    [activePhotoId, photos]
  );
  const activePosition = useMemo(() => {
    if (!activePhoto || !hasValidPhotoCoordinates(activePhoto)) return null;
    return {
      lat: Number.parseFloat(activePhoto.latitude),
      lng: Number.parseFloat(activePhoto.longitude),
    };
  }, [activePhoto]);

  const updatePhoto = (
    photoId: string,
    updates: Partial<DevicePhotoDraft>
  ) => {
    onChange(
      photos.map((photo) =>
        photo.id === photoId ? { ...photo, ...updates } : photo
      )
    );
  };

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    const remainingSlots = Math.max(0, 10 - photos.length);
    if (remainingSlots === 0) {
      setError("You can upload up to 10 photos at a time.");
      return;
    }

    setReadingMetadata(true);
    setError(
      selectedFiles.length > remainingSlots
        ? `Only the first ${remainingSlots} photo${remainingSlots === 1 ? "" : "s"} were added.`
        : null
    );
    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const drafts = await Promise.all(
      filesToAdd.map(async (file): Promise<DevicePhotoDraft> => {
        const coordinates = await extractPhotoCoordinates(file);
        return {
          id: uniquePhotoId(),
          file,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
          latitude: coordinates?.latitude.toFixed(6) ?? "",
          longitude: coordinates?.longitude.toFixed(6) ?? "",
          coordinateSource: coordinates ? "metadata" : "missing",
        };
      })
    );
    onChange([...photos, ...drafts]);
    setReadingMetadata(false);
  };

  const removePhoto = (photoId: string) => {
    const removedPhoto = photos.find((photo) => photo.id === photoId);
    if (removedPhoto) URL.revokeObjectURL(removedPhoto.previewUrl);
    const remaining = photos.filter((photo) => photo.id !== photoId);
    onChange(remaining);
    if (activePhotoId === photoId) {
      setActivePhotoId(remaining[0]?.id ?? null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-3 font-semibold text-gray-800 transition hover:bg-gray-50">
          <ImagePlus size={19} aria-hidden="true" />
          {readingMetadata ? "Reading photo locations…" : "Choose photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFiles}
            disabled={disabled || readingMetadata || photos.length >= 10}
          />
        </label>
        <p className="mt-2 text-xs text-gray-500">
          Select up to 10 photos. GPS coordinates are read from each photo when
          available.
        </p>
        {error && <p className="mt-2 text-sm text-amber-700">{error}</p>}
      </div>

      {photos.length > 0 && (
        <div className="rounded-md bg-gray-100 p-3 text-sm">
          <span className="font-semibold">
            {photos.length} photo{photos.length === 1 ? "" : "s"} → {groups.length}{" "}
            location{groups.length === 1 ? "" : "s"}
          </span>
          {unlocated.length > 0 && (
            <span className="mt-1 block text-amber-700">
              {unlocated.length} photo{unlocated.length === 1 ? " needs" : "s need"}{" "}
              a location before upload.
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {photos.map((photo) => {
          const coordinatesValid = hasValidPhotoCoordinates(photo);
          return (
            <div
              key={photo.id}
              className={`rounded-md border p-3 ${
                activePhotoId === photo.id
                  ? "border-ooh-yeah-pink"
                  : "border-gray-200"
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="h-20 w-20 flex-none rounded bg-gray-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{photo.name}</p>
                  <p
                    className={`mt-1 text-xs ${
                      coordinatesValid ? "text-green-700" : "text-amber-700"
                    }`}
                  >
                    {photo.coordinateSource === "metadata" && coordinatesValid
                      ? "GPS location detected"
                      : coordinatesValid
                        ? "Location added manually"
                        : "Location required"}
                  </p>
                </div>
                <button
                  type="button"
                  className="self-start rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                  onClick={() => removePhoto(photo.id)}
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
                    className="mt-1 w-full rounded border p-2 text-base sm:text-sm"
                    value={photo.latitude}
                    onChange={(event) =>
                      updatePhoto(photo.id, {
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
                    className="mt-1 w-full rounded border p-2 text-base sm:text-sm"
                    value={photo.longitude}
                    onChange={(event) =>
                      updatePhoto(photo.id, {
                        longitude: event.target.value,
                        coordinateSource: "manual",
                      })
                    }
                  />
                </label>
              </div>
              <button
                type="button"
                className="mt-2 flex min-h-11 items-center gap-1 text-sm font-medium text-ooh-yeah-pink hover:underline"
                onClick={() => setActivePhotoId(photo.id)}
              >
                <MapPin size={15} aria-hidden="true" />
                Set location on map
              </button>
            </div>
          );
        })}
      </div>

      {activePhoto && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Click the map to place{" "}
            <span className="font-semibold">{activePhoto.name}</span>
          </p>
          <CoordinatePickerMap
            key={activePhoto.id}
            position={activePosition}
            onPick={({ lat, lng }) =>
              updatePhoto(activePhoto.id, {
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

export default DevicePhotoImporter;
