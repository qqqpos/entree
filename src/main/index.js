'use strict'

// const { exec } = require("child_process");
const updater = require('electron-simple-updater');

import { app, BrowserWindow, ipcMain, powerSaveBlocker } from 'electron';

const powerID = powerSaveBlocker.start('prevent-display-sleep')
powerSaveBlocker.stop(powerID)

//disable security warning
process.env.ELECTRON_ENABLE_SECURITY_WARNINGS = false;

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
  const appParams = process.argv.slice(1);

  let option = {
    width: 1024,
    height: 768,
    resizable: false,
    //alwaysOnTop:true,
    frame: false,
    autoHideMenuBar: true,
    show: false
  };

  //appParams.some(args => args.includes("widescreen")) && 
  Object.assign(option, { width: 1920, height: 1080 });

  mainWindow = new BrowserWindow(option);
  mainWindow.loadURL(winURL);

  let { webContents } = mainWindow;
  webContents.on('did-finish-load', () => {
    webContents.setZoomFactor(1);
    webContents.setVisualZoomLevelLimits(1, 1);
    webContents.setLayoutZoomLevelLimits(0, 0);
  });

  appParams.some(args => args.includes("debug")) && webContents.openDevTools()

  splashWindow = new BrowserWindow({
    width: 460,
    height: 270,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: true
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

  if (appParams.some(args => args.includes("dual")) && externalDisplay) {
    externalWindow = new BrowserWindow({
      x: externalDisplay.bounds.x + 50,
      y: externalDisplay.bounds.y + 50,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      frame: false,
      width: 1024,
      height: 768,
      fullscreen: true,
      webPreferences: {
        webSecurity: false
      }
    })
    externalWindow.loadURL(externalURL)
  }

  //test
  // externalWindow = new BrowserWindow({
  //   autoHideMenuBar: true,
  //   skipTaskbar: true,
  //   frame: false,
  //   width: 1024,
  //   height: 768,
  //   webPreferences: {
  //     webSecurity: false
  //   }
  //   //fullscreen: true
  // })
  // externalWindow.loadURL(externalURL)

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
    mainWindow.center();
    mainWindow.show();
  });

  ipcMain.on("Relaunch", () => {
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
    app.exit(0)
  });

  ipcMain.on("Shutdown", () => require('child_process').exec('shutdown -s -f -t 0'));

  //end of


  splashWindow.once('ready-to-show', () => splashWindow.show())

  mainWindow.on('close', (e) => {
    mainWindow = null;
    splashWindow = null;
    e.preventDefault();
    process.exit(0);
  })
}

const singleInstance = app.makeSingleInstance((command, working) => {
  if (mainWindow) {
    mainWindow.isMinimized() && mainWindow.restore();
    mainWindow.focus();
  }
});

process.env.NODE_ENV === 'production' && singleInstance && app.quit(0);

app.on('ready', createWindow)

app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit(0));

app.on('activate', () => mainWindow === null && createWindow());

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