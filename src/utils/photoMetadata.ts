export type PhotoCoordinates = {
  latitude: number;
  longitude: number;
};

const coordinatesAreValid = (latitude: number, longitude: number) =>
  Number.isFinite(latitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  Number.isFinite(longitude) &&
  longitude >= -180 &&
  longitude <= 180;

export const extractPhotoCoordinates = async (
  photo: File
): Promise<PhotoCoordinates | null> => {
  try {
    const { gps } = await import("exifr");
    const metadata = await gps(photo);
    if (
      !metadata ||
      !coordinatesAreValid(metadata.latitude, metadata.longitude)
    ) {
      return null;
    }

    return {
      latitude: metadata.latitude,
      longitude: metadata.longitude,
    };
  } catch (error) {
    console.warn(`Could not read GPS metadata from ${photo.name}.`, error);
    return null;
  }
};

export const findFirstPhotoCoordinates = async (photos: File[]) => {
  const results = await Promise.all(
    photos.map(async (photo) => ({
      photo,
      coordinates: await extractPhotoCoordinates(photo),
    }))
  );

  return results.find((result) => result.coordinates !== null) ?? null;
};
