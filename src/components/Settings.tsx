import { useEffect, useState } from "react";
import {
  doc,
  type Firestore,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage,
} from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";

import firebaseInstancesPromise from "../firebase-config";

interface SiteSettings {
  homepageImageUrl: string;
  consultImageUrl: string;
  lastUpdated: Date;
}

const compressImage = (
  file: File,
  maxWidth?: number,
  maxHeight?: number,
  quality?: number
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const finalMaxWidth = maxWidth ?? 1920;
      const finalMaxHeight = maxHeight ?? 1080;
      const finalQuality = quality ?? 0.8;

      let { width, height } = img;

      if (width > finalMaxWidth || height > finalMaxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
          width = finalMaxWidth;
          height = width / aspectRatio;
        } else {
          height = finalMaxHeight;
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        finalQuality
      );
    };

    img.onerror = () => {
      resolve(file);
    };

    img.src = URL.createObjectURL(file);
  });
};

const Settings = () => {
  const [db, setDb] = useState<Firestore | null>(null);
  const [storage, setStorage] = useState<FirebaseStorage | null>(null);
  const [homepageImages, setHomepageImages] = useState<{
    homepage: File | null;
    consultImage: File | null;
  }>({ homepage: null, consultImage: null });
  const [currentImageUrl, setCurrentImageUrl] = useState<{
    homepage: string;
    consultImage: string;
  }>({
    homepage: "",
    consultImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [compressionStatus, setCompressionStatus] = useState<{
    homepage: boolean;
    consultImage: boolean;
  }>({ homepage: false, consultImage: false });

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const instances = await firebaseInstancesPromise;
        setDb(instances.db);
        setStorage(instances.storage);
        setInitialLoading(false);
      } catch (error) {
        console.error("Failed to initialize Firebase:", error);
        toast.error("Failed to initialize Firebase services");
      }
    };

    initFirebase();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!db) return;

      try {
        const settingsDocRef = doc(db, "settings", "siteSettings");
        const settingsDoc = await getDoc(settingsDocRef);

        if (settingsDoc.exists()) {
          const settingsData = settingsDoc.data() as SiteSettings;
          setCurrentImageUrl({
            homepage: settingsData.homepageImageUrl,
            consultImage: settingsData.consultImageUrl,
          });
        }
      } catch (error) {
        toast.error("Failed to load current settings");
        console.error("Error fetching settings:", error);
      }
    };

    if (db && !initialLoading) {
      fetchSettings();
    }
  }, [db, initialLoading]);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    key: "homepage" | "consultImage"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCompressionStatus((prev) => ({ ...prev, [key]: true }));

    try {
      const compressedFile = await compressImage(
        file,
        key === "homepage" ? 1920 : 1200,
        key === "homepage" ? 1080 : 800,
        0.8
      );

      setHomepageImages((prev) => ({ ...prev, [key]: compressedFile }));
    } catch (error) {
      console.error("Compression failed:", error);
      setHomepageImages((prev) => ({ ...prev, [key]: file }));
    } finally {
      setCompressionStatus((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !storage || !homepageImages) return;

    setLoading(true);
    try {
      const newUrls: Partial<SiteSettings> = {};

      if (homepageImages.homepage) {
        const homepageRef = ref(storage, "settings/homepage-image.jpg");
        await uploadBytes(homepageRef, homepageImages.homepage);
        const homepageUrl = await getDownloadURL(homepageRef);
        newUrls.homepageImageUrl = homepageUrl;
      }

      if (homepageImages.consultImage) {
        const consultImageRef = ref(storage, "settings/consult-image.jpg");
        await uploadBytes(consultImageRef, homepageImages.consultImage);
        const consultImageUrl = await getDownloadURL(consultImageRef);
        newUrls.consultImageUrl = consultImageUrl;
      }

      const settingsDocRef = doc(db, "settings", "siteSettings");
      const settingsDoc = await getDoc(settingsDocRef);

      if (settingsDoc.exists()) {
        await updateDoc(settingsDocRef, {
          ...newUrls,
          lastUpdated: new Date(),
        });
      } else {
        await setDoc(settingsDocRef, {
          homepageImageUrl: newUrls.homepageImageUrl || "",
          consultImageUrl: newUrls.consultImageUrl || "",
          lastUpdated: new Date(),
        });
      }

      setCurrentImageUrl((prev) => ({
        homepage: newUrls.homepageImageUrl || prev.homepage,
        consultImage: newUrls.consultImageUrl || prev.consultImage,
      }));
      setHomepageImages({ homepage: null, consultImage: null });
      toast.success("Images updated successfully!");
    } catch (error) {
      toast.error("Failed to update images");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ooh-yeah-pink" />
        </div>
        <p className="text-center mt-4">Loading settings...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="my-5">
        <h1 className="text-center lg:text-left text-2xl font-bold pl-4">
          Settings
        </h1>
      </div>
      <div className="m-5">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Homepage Image</h2>

            {currentImageUrl?.homepage && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">
                  Current Homepage Image:
                </p>
                <img
                  src={currentImageUrl.homepage}
                  alt="Current homepage"
                  className="max-h-60 object-cover border rounded"
                />
              </div>
            )}

            <label htmlFor="homepageImage" className="block font-medium mb-1">
              Upload New Homepage Image
            </label>
            <input
              id="homepageImage"
              type="file"
              accept="image/*"
              onChange={(event) => handleImageSelect(event, "homepage")}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Consult Image</h2>

            {currentImageUrl?.consultImage && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">
                  Current Consult Image:
                </p>
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/colmap-9f519.firebasestorage.app/o/settings%2Fconsult-image.jpg?alt=media"
                  alt="Current consult"
                  className="max-h-60 object-cover border rounded"
                />
              </div>
            )}

            <label htmlFor="consultImage" className="block font-medium mb-1">
              Upload New Consult Image
            </label>
            <input
              id="consultImage"
              type="file"
              accept="image/*"
              onChange={(event) => handleImageSelect(event, "consultImage")}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-ooh-yeah-pink text-white py-2 rounded font-bold hover:bg-ooh-yeah-pink-700 disabled:opacity-50"
            disabled={
              (!homepageImages.homepage && !homepageImages.consultImage) ||
              loading ||
              compressionStatus.homepage ||
              compressionStatus.consultImage
            }
          >
            {loading ? "Uploading..." : "Update Images"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Settings;
