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
  lastUpdated: Date;
}

const Settings = () => {
  const [db, setDb] = useState<Firestore | null>(null);
  const [storage, setStorage] = useState<FirebaseStorage | null>(null);
  const [homepageImage, setHomepageImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
          setCurrentImageUrl(settingsData.homepageImageUrl);
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setHomepageImage(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !storage || !homepageImage) return;

    setLoading(true);
    try {
      const storageRef = ref(
        storage,
        `settings/homepage_${Date.now()}_${homepageImage.name}`
      );
      await uploadBytes(storageRef, homepageImage);
      const downloadUrl = await getDownloadURL(storageRef);

      const settingsDocRef = doc(db, "settings", "siteSettings");
      const settingsDoc = await getDoc(settingsDocRef);

      if (settingsDoc.exists()) {
        await updateDoc(settingsDocRef, {
          homepageImageUrl: downloadUrl,
          lastUpdated: new Date(),
        });
      } else {
        await setDoc(settingsDocRef, {
          homepageImageUrl: downloadUrl,
          lastUpdated: new Date(),
        });
      }

      setCurrentImageUrl(downloadUrl);
      setHomepageImage(null);
      toast.success("Homepage image updated successfully!");
    } catch (error) {
      toast.error("Failed to update homepage image");
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Homepage Image</h2>
          {currentImageUrl && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Current Image:</p>
              <img
                src={currentImageUrl}
                alt="Current homepage"
                className="max-h-60 object-cover border rounded"
              />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="homepageImage" className="block font-medium mb-1">
              Upload New Homepage Image
            </label>
            <input
              id="homepageImage"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full p-2 border rounded"
            />
            {homepageImage && (
              <p className="text-sm mt-2">Selected: {homepageImage.name}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-ooh-yeah-pink text-white py-2 rounded font-bold hover:bg-ooh-yeah-pink-700 disabled:opacity-50"
            disabled={!homepageImage || loading}
          >
            {loading ? "Uploading..." : "Update Homepage Image"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Settings;
