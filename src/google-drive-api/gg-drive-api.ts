import { GGDriveService } from './gg-drive.service';
import configs from './config';
import logger from './logger';

(async () => {
  logger.logInfo('configs: %j', configs);
  const ggDriveService = new GGDriveService();
  // const folderInfo = await new GGDriveService().getFolderInfo(configs.GG_FOLDER_ID);
  // const folderId = ggDriveService.extractFileId(
  //   'https://drive.google.com/drive/folders/1eFMAG7XPK5Y9Xycl0sLiN9EjI8bOpk82?usp=sharing'
  // );
  // logger.logInfo('folderId: %j', folderId);
  // const folders = await ggDriveService.getListItemsTree({
  //   folderId: configs.GG_FOLDER_ID,
  // });
  // logger.logInfo('folders: %j', folders);

  const folderPermission = await ggDriveService.getPermissionsForFolderChildren(
    configs.GG_FOLDER_ID
  );
  logger.logInfo('folderPermission: %j', folderPermission);
})();
