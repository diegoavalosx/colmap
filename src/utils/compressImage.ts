export const compressImage = (
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
