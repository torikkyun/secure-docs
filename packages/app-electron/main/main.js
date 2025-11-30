import { app, BrowserWindow } from "electron";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Production App Serving ---
// Dynamically import and configure electron-serve for packaged apps.
const appServe = await (async () => {
  if (!app.isPackaged) return null;

  try {
    const serve = (await import("electron-serve")).default;
    return serve({ directory: path.join(__dirname, "../out") });
  } catch (err) {
    console.error(
      "Không thể tải electron-serve. Ứng dụng đã đóng gói sẽ không hoạt động.",
      err
    );
    return null;
  }
})();

// --- Dev Server Probing ---
/**
 * Probes for a running Next.js dev server on ports 3000-3010.
 * @returns {Promise<string>} A promise that resolves with the server URL.
 * @throws {Error} If no server is found after several attempts.
 */
const findNextUrl = async () => {
  const ports = Array.from({ length: 11 }, (_, i) => 3000 + i);
  const checkPort = (port) =>
    new Promise((resolve, reject) => {
      const req = http.get(
        { host: "127.0.0.1", port, path: "/", timeout: 1000 },
        (res) => {
          const { statusCode } = res;
          if (statusCode !== 200) {
            res.resume(); // Consume response data to free up memory
            return reject(new Error(`Mã trạng thái HTTP: ${statusCode}`));
          }

          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            // Check if the response looks like a Next.js HTML page
            if (/<!doctype html>|<html/i.test(data)) {
              resolve(`http://localhost:${port}`);
            } else {
              reject(
                new Error("Phản hồi không phải là một trang HTML hợp lệ.")
              );
            }
          });
        }
      );

      req.on("error", (err) => reject(err));
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Yêu cầu đã hết thời gian chờ."));
      });
    });

  // Attempt to connect for up to 15 seconds (30 attempts * 500ms delay)
  for (let i = 0; i < 30; i++) {
    try {
      // Promise.any resolves as soon as one of the port checks succeeds
      const url = await Promise.any(ports.map(checkPort));
      return url;
    } catch (err) {
      // All port checks failed, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error(
    "Không tìm thấy máy chủ dev Next.js trên các cổng 3000-3010. Vui lòng khởi động nó và thử lại."
  );
};

// --- Main Window Creation ---
const createWindow = async () => {
  const win = new BrowserWindow({
    show: false, // Đừng hiển thị cho đến khi sẵn sàng
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // It's a good practice to keep devTools disabled for production builds
      devTools: !app.isPackaged,
    },
  });

  // Maximize window
  win.maximize();
  win.show();

  // Handle Shortcuts (DevTools & Zoom)
  win.webContents.on("before-input-event", (event, input) => {
    const isDevToolsShortcut =
      input.key === "F12" ||
      ((input.control || input.meta) &&
        input.shift &&
        input.key.toUpperCase() === "I");

    if (isDevToolsShortcut) {
      event.preventDefault();
      return;
    }

    // Handle Zoom
    if (input.control || input.meta) {
      const { key } = input;
      if (key === "=" || key === "+") {
        win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 1);
        event.preventDefault();
      } else if (key === "-") {
        win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 1);
        event.preventDefault();
      } else if (key === "0") {
        win.webContents.setZoomLevel(0);
        event.preventDefault();
      }
    }
  });

  // --- Load Content ---
  if (appServe) {
    // Production: serve static files from the 'out' directory
    await appServe(win);
    win.loadURL("app://-");
  } else {
    // Development: find and load the Next.js dev server
    try {
      const url = await findNextUrl();
      await win.loadURL(url);
    } catch (err) {
      console.error("Lỗi khi tải máy chủ dev Next.js:", err);
      // Load a blank page with an error message as a fallback
      win.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(
          `<html><body><h2>Lỗi</h2><p>${err.message}</p></body></html>`
        )}`
      );
    }
  }
};

// --- App Lifecycle ---
app.on("ready", () => {
  createWindow().catch((err) => console.error("Tạo cửa sổ thất bại:", err));
});

app.on("window-all-closed", () => {
  // On macOS, it's common for applications to stay active until the user quits explicitly
  if (process.platform !== "darwin") {
    app.quit();
  }
});
