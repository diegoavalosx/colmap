import { deleteObject, ref, type FirebaseStorage } from "firebase/storage";

export const deleteOldImage = async (
  storage: FirebaseStorage,
  imageUrl: string
) => {
  if (!imageUrl) return;

  try {
    const urlParts = imageUrl.split("/o/")[1];
    if (urlParts) {
      const pathPart = urlParts.split("?")[0];
      const decodedPath = decodeURIComponent(pathPart);
      const imageRef = ref(storage, decodedPath);
      await deleteObject(imageRef);
      console.log("Old image deleted successfully");
    }
  } catch (error) {
    console.warn("Failed to delete old image:", error);
  }
};
