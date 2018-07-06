'use strict'

// const { exec } = require("child_process");
const updater = require('electron-simple-updater');

import { app, BrowserWindow, ipcMain, powerSaveBlocker } from 'electron';

powerSaveBlocker.start('prevent-display-sleep');

//auto updater
updater.init({
  checkUpdateOnStart: false,
  autoDownload: false
})

let mainWindow = false;
let winURL = `http://localhost:9080`;
let splashWindow = false;
let splashURL = `http://localhost:9080/splash.html`
let externalWindow = false;
let externalURL = `http://localhost:9080/external.html`;
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');

  winURL = `file://${__dirname}/index.html`;
  splashURL = `file://${__dirname}/splash.html`;
  externalURL = `file://${__dirname}/external.html`;
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    resizable: false,
    //alwaysOnTop:true,
    frame: false,
    autoHideMenuBar: true,
    show: false
  })
  mainWindow.loadURL(winURL);

  const appParams = process.argv.slice(1);

  appParams.some(args => args.includes("debug")) && mainWindow.webContents.openDevTools()

  splashWindow = new BrowserWindow({
    width: 460,
    height: 270,
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    show: false,
    skipTaskbar: true
  })
  splashWindow.loadURL(splashURL);

  // external display setup

  const electronScreen = require('electron').screen;
  const displays = electronScreen.getAllDisplays();
  let externalDisplay = null;

  for (let i in displays) {
    if (displays[i].bounds.x != 0 || displays[i].bounds.y != 0) {
      externalDisplay = displays[i];
      break;
    }
  }

  // if (appParams.some(args => args.includes("dual")) && externalDisplay) {
  //   externalWindow = new BrowserWindow({
  //     x: externalDisplay.bounds.x + 50,
  //     y: externalDisplay.bounds.y + 50,
  //     autoHideMenuBar: true,
  //     alwaysOnTop: true,
  //     skipTaskbar: true,
  //     frame: false,
  //     width: 1024,
  //     height: 768,
  //     fullscreen: true,
  //     webPreferences: {
  //       webSecurity: false
  //     }
  //   })
  //   externalWindow.loadURL(externalURL)
  // }



  //test
  externalWindow = new BrowserWindow({
    autoHideMenuBar: true,
    skipTaskbar: true,
    frame: false,
    width: 1024,
    height: 768,
    webPreferences: {
      webSecurity: false
    }
    //fullscreen: true
  })
  externalWindow.loadURL(externalURL)

  //end test


  // add event listener

  ipcMain.on("Exit", () => app.quit(0));
  ipcMain.on("Loading", (e, text) => splashWindow.webContents.send("Processing", text));

  if (externalWindow) {
    ipcMain.on("External::config", (e, config) => externalWindow.webContents.send("External::config", config));
    ipcMain.on("External::stage", (e, stage) => externalWindow.webContents.send("External::stage", stage));
    ipcMain.on("External::update", (e, order) => externalWindow.webContents.send("External::update", order));
  }

  ipcMain.on("Initialized", () => {
    process.argv.slice(1).some(arg => arg.includes("fullscreen")) && mainWindow.setFullScreen(true);
    splashWindow.close();
    mainWindow.show();
    mainWindow.center();
  });

  ipcMain.on("Relaunch", () => {
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
    app.exit(0)
  });

  ipcMain.on("Shutdown", () => {
    const exec = require('child_process').exec;
    exec('shutdown -s -f -t 0');
  });

  //end of


  splashWindow.once('ready-to-show', () => splashWindow.show())

  mainWindow.on('closed', () => {
    mainWindow = null;
    splashWindow = null;
    process.exit(0);
  })
}

const singleInstance = app.makeSingleInstance((command, working) => {
  if (mainWindow) {
    mainWindow.isMinimized() && mainWindow.restore();
    mainWindow.focus();
  }
});

singleInstance && app.quit(0);

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit(0)
  }
})

app.on('activate', () => {
  mainWindow === null && createWindow()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */