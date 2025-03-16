import { copyFile, readdirSync, rmdir, rmSync, unlink, unlinkSync } from 'fs';
import path from 'path';

const tmpPath = path.resolve(__dirname, '../../tmp');

function unlinkFile() {
  // Callback
  try {
    unlink(`${tmpPath}/test.txt`, () => {
      console.log('Unlink the file succeed');
    });
  } catch (err) {
    console.error('unlinkFile Error: ', err);
  }
}

// unlinkFile();

function unlinkSyncFile() {
  // Synchronous
  try {
    unlinkSync(`${tmpPath}/test.txt`);
    console.log('Sync unlink the file succeed');
  } catch (err) {
    console.error('unlinkFile Error: ', err);
  }
}

// unlinkSyncFile();

async function copyTheFile() {
  // Synchronous
  try {
    copyFile(`${tmpPath}/test.txt`, `${tmpPath}/test-copy.txt`, () => {
      console.log('Copy the file succeed');
    });
  } catch (err) {
    console.log('The file could not be copied');
  }
}

// copyTheFile();

/**
 * The function only delete folder with empty files
 */
function removeFolder() {
  // Synchronous
  try {
    rmdir(path.resolve(__dirname, '../../test1'), () => {
      console.log('Remove the folder succeed');
    });
  } catch (err) {
    console.log('The folder could not be deleted');
  }
}

// removeFolder();

/**
 * The function will delete folder with multiple files are existing
 */
function removeFolderHaveFiles() {
  // Synchronous
  try {
    const p = path.resolve(__dirname, '../../test');
    // Remove all files in the folder
    readdirSync(p).forEach((file) => {
      rmSync(`${p}/${file}`, {
        recursive: true,
        force: true,
      });
    });

    // and after removed all this folder and will be deleted this folder
    rmdir(path.resolve(__dirname, '../../test'), () => {
      console.log('Remove the folder succeed');
    });
  } catch (err) {
    console.log('The folder could not be deleted: ', err);
  }
}

removeFolderHaveFiles();
