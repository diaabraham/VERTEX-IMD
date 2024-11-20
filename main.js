const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
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

async function initDatabase() {
  try {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: 'database.sqlite',
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
        throw error;
      }
    });

    ipcMain.handle('add-infrastructure', async (event, data) => {
      try {
        return await Infrastructure.create(data);
      } catch (error) {
        console.error('Error adding infrastructure:', error);
        throw error;
      }
    });

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    dialog.showErrorBox('Database Error', 'Unable to connect to the database. The application will now exit.');
    app.quit();
  }
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Uncaught Exception', `An unexpected error occurred: ${error.message}`);
  app.quit();
});