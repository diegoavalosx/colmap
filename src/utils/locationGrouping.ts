export const LOCATION_GROUP_RADIUS_METERS = 30;

export type PhotoWithCoordinates = {
  latitude: string;
  longitude: string;
};

export type PhotoLocationGroup<T extends PhotoWithCoordinates> = {
  latitude: number;
  longitude: number;
  photos: T[];
};

type ParsedCoordinates = {
  latitude: number;
  longitude: number;
};

export const parsePhotoCoordinates = (
  photo: PhotoWithCoordinates
): ParsedCoordinates | null => {
  const latitude = Number.parseFloat(photo.latitude);
  const longitude = Number.parseFloat(photo.longitude);
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
};

export const hasValidPhotoCoordinates = (photo: PhotoWithCoordinates) =>
  parsePhotoCoordinates(photo) !== null;

export const distanceBetweenCoordinates = (
  first: ParsedCoordinates,
  second: ParsedCoordinates
) => {
  const earthRadiusMeters = 6_371_000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const recalculateCenter = <T extends PhotoWithCoordinates>(photos: T[]) => {
  const coordinates = photos
    .map(parsePhotoCoordinates)
    .filter((value): value is ParsedCoordinates => value !== null);
  return {
    latitude:
      coordinates.reduce((sum, value) => sum + value.latitude, 0) /
      coordinates.length,
    longitude:
      coordinates.reduce((sum, value) => sum + value.longitude, 0) /
      coordinates.length,
  };
};

export const groupPhotosByLocation = <T extends PhotoWithCoordinates>(
  photos: T[],
  radiusMeters = LOCATION_GROUP_RADIUS_METERS
) => {
  const groups: PhotoLocationGroup<T>[] = [];
  const unlocated: T[] = [];

  photos.forEach((photo) => {
    const coordinates = parsePhotoCoordinates(photo);
    if (!coordinates) {
      unlocated.push(photo);
      return;
    }

    const compatibleGroups = groups
      .map((group, index) => ({
        group,
        index,
        centerDistance: distanceBetweenCoordinates(coordinates, group),
      }))
      .filter(({ group }) =>
        group.photos.every((member) => {
          const memberCoordinates = parsePhotoCoordinates(member);
          return (
            memberCoordinates !== null &&
            distanceBetweenCoordinates(coordinates, memberCoordinates) <=
              radiusMeters
          );
        })
      )
      .sort((first, second) => first.centerDistance - second.centerDistance);

    const closestGroup = compatibleGroups[0];
    if (!closestGroup) {
      groups.push({ ...coordinates, photos: [photo] });
      return;
    }

    const updatedPhotos = [...closestGroup.group.photos, photo];
    groups[closestGroup.index] = {
      ...recalculateCenter(updatedPhotos),
      photos: updatedPhotos,
    };
  });

  return { groups, unlocated };
};
