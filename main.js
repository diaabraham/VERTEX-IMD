const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

let mainWindow;
let sequelize;

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
  mainWindow.webContents.openDevTools(); // This will always open DevTools

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded');
  });
}

app.whenReady().then(() => {
  createWindow();
  initDatabase();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

async function initDatabase() {
  try {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, 'database.sqlite'),
      logging: false
    });

    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    const Infrastructure = sequelize.define('Infrastructure', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastMaintenance: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await sequelize.sync();
    console.log('Database synchronized successfully.');

    ipcMain.handle('get-infrastructure', async () => {
      try {
        return await Infrastructure.findAll();
      } catch (error) {
        console.error('Error fetching infrastructure:', error);
        return [];
      }
    });

    ipcMain.handle('add-infrastructure', async (event, data) => {
      try {
        return await Infrastructure.create(data);
      } catch (error) {
        console.error('Error adding infrastructure:', error);
        return null;
      }
    });

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}