import React from "react";
import { useScreenshot, createFileName } from "use-react-screenshot";

function ScreenshotButton ({scrnRef}) {
  const [image, takeScreenShot] = useScreenshot({
    type: "image/jpeg",
    quality: 1.0
  });

  const download = (image, { name = "labelfmchart", extension = "jpg" } = {}) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
  };

  const downloadScreenshot = () => takeScreenShot(scrnRef.current).then(download);

  return (
    <div>
      <button onClick={downloadScreenshot}>Download screenshot</button>
    </div>
  );
};

export default ScreenshotButton;