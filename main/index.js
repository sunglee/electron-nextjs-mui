// Native
const { join } = require("path");
const { format } = require("url");

// Packages
const { BrowserWindow, app, ipcMain, Menu } = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");
const Store = require("electron-store");
const store = new Store();
// store.set("unicorn", "🦄");
// console.log(store.get("unicorn"));

global.sharedObject = {
  someProperty: "default value"
};

let mainWindow;

// Prepare the renderer once the app is ready
const createWindow = async () => {
  await prepareNext("./renderer");

  mainWindow = new BrowserWindow({
    center: true,
    width: 1024,
    height: 768,
    minWidth: 640,
    minHeight: 480,
    show: false,
    // titleBarStyle: "hidden",
    webPreferences: {
      // nodeIntegration: false,
      preload: join(__dirname, "preload.js")
    }
  });

  const url = isDev
    ? "http://localhost:8000/"
    : format({
        pathname: join(__dirname, "../renderer/index.html"),
        protocol: "file:",
        slashes: true
      });

  mainWindow.loadURL(url);

  if (isDev) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools({ mode: "undocked" });
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
    // const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require("electron-devtools-installer");
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => {
        console.log(`Added Extension: ${name}`);
      })
      .catch(err => {
        console.log("An error occurred: ", err);
      });
    // installExtension(REDUX_DEVTOOLS)
    //   .then(name => {
    //     console.log(`Added Extension: ${name}`);
    //   })
    //   .catch(err => {
    //     console.log("An error occurred: ", err);
    //   });
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    ipcMain.on("open-external-window", (event, arg) => {
      shell.openExternal(arg);
    });
  });

  mainWindow.on("closed", () => (mainWindow = null));
};

const generateMenu = () => {
  const template = [
    {
      label: "File",
      submenu: [{ role: "about" }, { role: "quit" }]
    },
    {
      label: "Edit",
      submenu: [{ role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "pasteandmatchstyle" }, { role: "delete" }, { role: "selectall" }]
    },
    // todo: remove toggledevtools if not isDev
    {
      label: "View",
      submenu: [{ role: "reload" }, { role: "forcereload" }, { role: "toggledevtools" }, { type: "separator" }, { role: "resetzoom" }, { role: "zoomin" }, { role: "zoomout" }, { type: "separator" }, { role: "togglefullscreen" }]
    },
    {
      role: "window",
      submenu: [{ role: "minimize" }, { role: "close" }]
    },
    {
      role: "help",
      submenu: [
        {
          click() {
            require("electron").shell.openExternal("https://github.com");
          },
          label: "Learn More"
        },
        {
          click() {
            require("electron").shell.openExternal("https://github.com");
          },
          label: "File Issue on Github"
        }
      ]
    }
  ];

  // if (process.platform === "darwin") {
  //   template.unshift({
  //     label: app.getName(),
  //     submenu: [{ role: "about" }, { type: "separator" }, { role: "services", submenu: [] }, { type: "separator" }, { role: "hide" }, { role: "hideothers" }, { role: "unhide" }, { type: "separator" }, { role: "quit" }]
  //   });

  //   // Edit menu
  //   template[1].submenu.push(
  //     { type: "separator" },
  //     {
  //       label: "Speech",
  //       submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
  //     }
  //   );

  //   // Window menu
  //   template[3].submenu = [{ role: "close" }, { role: "minimize" }, { role: "zoom" }, { type: "separator" }, { role: "front" }];
  // }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

app.on("ready", () => {
  createWindow();
  generateMenu();
});

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", (event, message) => {
  event.sender.send("message", message);
});

// ipcMain.on("getLocalStatus", (event, data) => {
//   event.sender.send(JSON.parse(window.localStorage.getItem("statuses") || "[]"));
// });

// get an item or defaultValue if it does not exists from store
ipcMain.on("getStore", (event, key) => {
  event.returnValue = store.get(key, false);
});

// set item key value pair
ipcMain.on("setStoreKeyVal", (event, key, val) => {
  store.set(key, val);
});

// set multiple item at once
ipcMain.on("setStoreObject", (event, obj) => {
  store.set(obj);
});

// check if an item exists
ipcMain.on("hasStoreWithKey", (event, key) => {
  event.returnValue = store.has(key);
});

// delete an item
ipcMain.on("deleteStoreWithKey", (event, key) => {
  store.delete(key);
});
