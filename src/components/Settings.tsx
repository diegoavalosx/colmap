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
          console.log(currentImageUrl);
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

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: "homepage" | "consultImage"
  ) => {
    const files = event.target.files?.[0];
    if (files) {
      setHomepageImages((prev) => ({ ...prev, [key]: files }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !storage || !homepageImages) return;

    setLoading(true);
    try {
      const newUrls: Partial<SiteSettings> = {};

      if (homepageImages.homepage) {
        const homepageRef = ref(
          storage,
          `settings/homepage_${Date.now()}_${homepageImages.homepage}`
        );
        await uploadBytes(homepageRef, homepageImages.homepage);
        const homepageUrl = await getDownloadURL(homepageRef);
        newUrls.homepageImageUrl = homepageUrl;
      }
      if (homepageImages.consultImage) {
        const consultImageRef = ref(
          storage,
          `settings/homepage_${Date.now()}_${homepageImages.homepage}`
        );
        await uploadBytes(consultImageRef, homepageImages.consultImage);
        const consultImagenUrl = await getDownloadURL(consultImageRef);
        newUrls.consultImageUrl = consultImagenUrl;
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
            {homepageImages.homepage && (
              <p className="text-sm mt-2">
                Selected: {homepageImages.homepage.name}
              </p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Consult Image</h2>

            {currentImageUrl?.consultImage && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">
                  Current Consult Image:
                </p>
                <img
                  src={currentImageUrl.consultImage}
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
            {homepageImages.consultImage && (
              <p className="text-sm mt-2">
                Selected: {homepageImages.consultImage.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-ooh-yeah-pink text-white py-2 rounded font-bold hover:bg-ooh-yeah-pink-700 disabled:opacity-50"
            disabled={
              (!homepageImages.homepage && !homepageImages.consultImage) ||
              loading
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
