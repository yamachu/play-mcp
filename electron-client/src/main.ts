import { app, BrowserWindow } from "electron";

app.whenReady().then(() => {
  const win = new BrowserWindow({
    title: "Main window",
  });

  win.show();
});
