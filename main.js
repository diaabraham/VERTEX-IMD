const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Sequelize, DataTypes } = require('sequelize');

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  initDatabase();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

function initDatabase() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
  });

  const Infrastructure = sequelize.define('Infrastructure', {
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    status: DataTypes.STRING,
    lastMaintenance: DataTypes.DATE
  });

  sequelize.sync().then(() => {
    console.log('Database initialized');
  });

  ipcMain.handle('get-infrastructure', async () => {
    return await Infrastructure.findAll();
  });

  ipcMain.handle('add-infrastructure', async (event, data) => {
    return await Infrastructure.create(data);
  });
}