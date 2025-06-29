import { google, drive_v3 } from 'googleapis';
import { PassThrough } from 'stream';
import path from 'path';
import logger from './logger';
import configs from './config';
import AxiosLib from './axios.lib';
import fs from 'fs';
import {
  IQueryFolder,
  IQuerySearchFolder,
  IUploadFile,
  ICreateFolder,
  IDeleteFolderFile,
  IRenameFolder,
  IResGGDrive,
  IFileGGDrive,
  IResSyncFileFolder,
  IFolderDetail,
  IResponseGetFolder,
  IFile,
  IFolder,
  FolderTreeItems,
  GGDriveGetListItemsTreeFilter,
  IQueryFolderList,
} from './gg-drive.type';

const bufferToStream = (buffer: IFileGGDrive) => {
  const stream = new PassThrough();
  stream.end(buffer);
  return stream;
};

export interface GGDriveServiceInterface {
  getFolderData: (inp: IQueryFolder) => Promise<IResponseGetFolder | IResGGDrive>;
  searchFileFolder: (inp: IQuerySearchFolder) => Promise<{ files: IFolderDetail[] } | IResGGDrive>;
  uploadFile: (inp: IUploadFile) => Promise<IFile[] | IFileGGDrive>;
  createFolder: (inp: ICreateFolder) => Promise<IFolder | IFileGGDrive>;
  renameFileFolder: (inp: IRenameFolder) => Promise<IFolder | IFileGGDrive>;
  deleteFolderFile: (inp: IDeleteFolderFile) => Promise<IFolder | IFile | IFileGGDrive>;
  syncFileFolder: (
    link: string,
    targetFolderName: string,
    folderID: string
  ) => Promise<IResSyncFileFolder>;
  searchFilesRecursive: (folderId: string) => Promise<IFileGGDrive[]>;
  getFolderIdFromLink: (link: string) => any;
  getAllFilesFromLink: (link: string) => Promise<FolderTreeItems[]>;
  getListItemsTree: (inp: GGDriveGetListItemsTreeFilter) => Promise<FolderTreeItems[]>;
  getListFolderData: (inp: IQueryFolderList) => Promise<any>;
  getFolderInfo: (folderID: string) => Promise<any>;
  getPermissionsForFolderChildren: (
    folderId: string
  ) => Promise<drive_v3.Schema$Permission[] | undefined>;
}

export class GGDriveService implements GGDriveServiceInterface {
  private readonly GG_API_KEY: string;
  private readonly GG_API: string;
  private readonly GG_AUTH: any;
  private readonly GG_DRIVE: drive_v3.Drive;

  constructor() {
    this.GG_API_KEY = configs.GG_API_KEY;
    this.GG_API = 'https://www.googleapis.com/drive/v3';
    const configGG = this.getGGAuthConfig();

    this.GG_AUTH = new google.auth.GoogleAuth({
      credentials: { ...configGG, private_key: configGG.private_key },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    this.GG_DRIVE = google.drive({ version: 'v3', auth: this.GG_AUTH });
  }

  async getFolderInfo(folderID: string): Promise<any> {
    const API_KEY = this.GG_API_KEY;

    try {
      const fields = [
        'id',
        'name',
        'mimeType',
        'modifiedTime',
        'createdTime',
        'iconLink',
        'thumbnailLink',
        'webViewLink',
        'webContentLink',
        'size',
        'parents',
      ];

      const url = `${this.GG_API}/files/${folderID}?key=${API_KEY}&fields=${fields.join(',')}`;
      const response = await AxiosLib.get(url);

      return {
        ...response.data,
        linkPreview: response.data.webViewLink,
        isFolder: response.data.mimeType === 'application/vnd.google-apps.folder',
      };
    } catch (error) {
      logger.logError('GGDriveService -> getFolderInfo -> error', error);
      return null;
    }
  }

  async getFolderData(inp: IQueryFolder): Promise<any> {
    const API_KEY = this.GG_API_KEY;

    const { folderID } = inp;

    try {
      const fields = [
        'name',
        'kind',
        'fileExtension',
        'mimeType',
        'thumbnailLink',
        'lastModifyingUser',
        'size',
        'id',
        'modifiedTime',
        'webViewLink',
        'webContentLink',
        'iconLink',
      ];
      // eslint-disable-next-line max-len
      const url = `${this.GG_API}/files?key=${API_KEY}&fields=files(${fields.join(',')})&orderBy=name&q='${folderID}'+in+parents`;
      const response = await AxiosLib.get(url);
      logger.logInfo('GGDriveService -> getFolderData -> response: %j', response.data);
      return {
        data: response.data.files.map(
          (file: { name: string; fileExtension: any; mimeType: string; webViewLink: any }) => ({
            ...file,
            name: file.name.replace(`${file.fileExtension ? `.${file.fileExtension}` : ''}`, ''),
            mimeType: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
            linkPreview: file.webViewLink,
            fileExtension: file.fileExtension ? `.${file.fileExtension}` : '',
            mimeTypePure: file.mimeType,
          })
        ),
      };
    } catch (error) {
      logger.logError('GGDriveService -> getFolderData -> error', error);
      return { files: [] };
    }
  }

  async getListFolderData(inp: IQueryFolderList): Promise<any> {
    const { folderIds } = inp;

    try {
      logger.logInfo('GGDriveService -> getListFolderData -> folderIds: %j', folderIds);
      const folderQuery = folderIds?.map((id) => `'${id}' in parents`).join(' or ');

      const fields = [
        'name',
        'kind',
        'fileExtension',
        'mimeType',
        'thumbnailLink',
        'lastModifyingUser',
        'size',
        'id',
        'modifiedTime',
        'webViewLink',
        'webContentLink',
        'iconLink',
      ];

      const response = await this.GG_DRIVE.files.list({
        q: folderQuery,
        fields: `files(${fields.join(',')})`,
        orderBy: 'name',
      });
      return {
        data: response?.data?.files?.map((file) => ({
          ...file,
          name: file.name?.replace(`${file.fileExtension ? `.${file.fileExtension}` : ''}`, ''),
          mimeType: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
          linkPreview: file.webViewLink,
          fileExtension: file.fileExtension ? `.${file.fileExtension}` : '',
          mimeTypePure: file.mimeType,
        })),
      };
    } catch (error) {
      logger.logError('GGDriveService -> getListFolderData -> error', error);
      return { files: [] };
    }
  }

  async fetchFiles(query: string): Promise<IResGGDrive> {
    const API_KEY = this.GG_API_KEY;
    const fields = [
      'name',
      'kind',
      'fileExtension',
      'mimeType',
      'thumbnailLink',
      'lastModifyingUser',
      'size',
      'id',
      'modifiedTime',
      'iconLink',
    ];
    try {
      const url = `${this.GG_API}/files?q=${query}&key=${API_KEY}&fields=files(${fields.join(',')})`;
      const response: { data: IResGGDrive } = await AxiosLib.get(url);
      return response.data;
    } catch (error) {
      logger.logError('GGDriveService -> fetchFiles -> error', error);
      return { files: [] };
    }
  }

  async searchRecursive(folderId: string, text: string): Promise<IFileGGDrive[]> {
    let resultFiles: IFileGGDrive[] = [];
    const folderQuery = `'${folderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'`;
    const fileQuery = `'${folderId}'+in+parents+and+name+contains+'${text}'`;

    const { files: currentFiles } = await this.fetchFiles(fileQuery);

    resultFiles = [...resultFiles, ...currentFiles];

    const { files: subFolders } = await this.fetchFiles(folderQuery);

    for (const folder of subFolders) {
      const subFiles = await this.searchRecursive(folder.id, text);
      resultFiles = [...resultFiles, ...subFiles];
    }

    return resultFiles;
  }

  async searchFileFolder(inp: IQuerySearchFolder): Promise<IResGGDrive> {
    const { folderID = '', searchText = '' } = inp;

    try {
      const result = await this.searchRecursive(folderID, searchText);
      return { files: result };
    } catch (error) {
      logger.logError('GGDriveService -> searchFileFolder -> error', error);
      return { files: [] };
    }
  }

  async uploadFile(inp: IUploadFile): Promise<IFileGGDrive> {
    const { file, folderId } = inp;
    try {
      const fileInfo = file[0];

      const media = {
        mimeType: fileInfo.mimetype,
        body: bufferToStream(fileInfo.buffer),
        name: fileInfo.originalname,
      };

      const response = (await this.GG_DRIVE.files.create({
        requestBody: {
          name: fileInfo.originalname,
          parents: [folderId],
        },
        media,
        fields: 'id',
      })) as any;

      return response.data;
    } catch (error) {
      logger.logError('GGDriveService -> uploadFile -> error', error);
      throw error;
    }
  }

  async createFolder(inp: ICreateFolder): Promise<IFileGGDrive> {
    const { folderName, folderId } = inp;
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId],
      };

      const response = (await this.GG_DRIVE.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      })) as any;

      return response.data;
    } catch (error) {
      logger.logError('GGDriveService -> createFolder -> error', error);
      throw error;
    }
  }

  async renameFileFolder(inp: IRenameFolder): Promise<IFileGGDrive> {
    const { folderName, folderId } = inp;
    try {
      const response = (await this.GG_DRIVE.files.update({
        fileId: folderId,
        requestBody: {
          name: folderName,
        },
        fields: 'id, name',
      })) as any;

      return response.data;
    } catch (error) {
      logger.logError('GGDriveService -> renameFileFolder -> error', error);
      throw error;
    }
  }

  async deleteFolderFile(inp: IDeleteFolderFile): Promise<IFileGGDrive> {
    const { folderId } = inp;

    try {
      const response = (await this.GG_DRIVE.files.update({
        fileId: folderId,
        requestBody: {
          trashed: true,
        },
      })) as any;

      return response.data;
    } catch (error) {
      logger.logError('GGDriveService -> deleteFolderFile -> error', error);
      throw error;
    }
  }

  async downloadFile(fileId: string): Promise<IFileGGDrive> {
    try {
      const fileUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
      const response = await AxiosLib.get(fileUrl, { responseType: 'arraybuffer' });
      return response.data;
    } catch (error: any) {
      logger.logError('GGDriveService -> downloadFile -> error', error);
      if (error?.message?.includes('File not found')) {
        throw new Error(`File with ID ${fileId} not found or not accessible`);
      }
      throw error;
    }
  }

  async syncFileFolder(
    link: string,
    targetFolderName: string,
    folderID: string
  ): Promise<IResSyncFileFolder> {
    try {
      if (!link || !targetFolderName) {
        throw new Error('Link and target folder name are required');
      }

      const sourceFolderId = this.getFolderIdFromLink(link) || '';

      // check if target folder exists
      const dataRootFolder = await this.getFolderData({ folderID });
      const isExistTargetFolder = dataRootFolder.data.find(
        (item: { mimeType: string; name: string }) =>
          item.mimeType === 'folder' && item.name === targetFolderName
      );

      if (isExistTargetFolder) {
        throw new Error(`${targetFolderName} already exists!`);
      }

      // Create new target folder
      const targetFolder = await this.createFolder({
        folderName: targetFolderName,
        folderId: folderID,
      });

      // Helper function to copy files and folders recursively
      const copyFolderContents = async (sourceId: string, targetId: string) => {
        try {
          const { data: items } = await this.getFolderData({ folderID: sourceId });

          for (const item of items) {
            if (item.mimeType === 'folder') {
              // Create new folder in target
              const newFolder = await this.createFolder({
                folderName: item.name,
                folderId: targetId,
              });
              // Recursively copy contents of this folder
              await copyFolderContents(item.id, newFolder.id);
            } else {
              try {
                // download file
                const file = await this.downloadFile(item.id);

                // upload file to target folder
                const media = {
                  mimeType: item.mimeTypePure,
                  body: bufferToStream(file),
                  name: item.name,
                };

                // create file in target folder
                await this.GG_DRIVE.files.create({
                  requestBody: {
                    name: item.name,
                    parents: [targetId],
                  },
                  media,
                  fields: 'id',
                });
              } catch (fileError: any) {
                logger.logError(
                  'GGDriveService -> copyFolderContents -> file copy error',
                  fileError
                );
                if (fileError?.message?.includes('File not found')) {
                  logger.logError(
                    `File with ID ${item.id} not found or not accessible, skipping...`
                  );
                  // Continue with the next file instead of failing the entire operation
                  continue;
                }
                throw fileError;
              }
            }
          }
        } catch (error) {
          logger.logError('GGDriveService -> copyFolderContents -> error', error);
          throw error;
        }
      };

      // Start recursive copy from source folder to target folder
      await copyFolderContents(sourceFolderId, targetFolder.id);

      return {
        success: true,
        targetFolderId: targetFolder.id,
        message: `Successfully synced folder contents to ${targetFolderName}`,
      };
    } catch (error) {
      logger.logError('GGDriveService -> syncFile -> error', error);
      throw error;
    }
  }

  getGGAuthConfig(): Record<string, any> {
    try {
      const file = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), 'src/google-drive-api/gg-auth-config.json'),
          'utf8'
        )
      );
      return file;
    } catch (error) {
      logger.logError('GGDriveService -> getGGAuthConfig -> error: ', error);
      return {};
    }
  }

  getFolderIdFromLink(link: string = '') {
    const sourceFolderId = link?.split('/').pop()?.split('?')[0];
    return sourceFolderId;
  }

  extractFileId(url: string): string {
    const match = url.match(/\/file\/d\/([^\/]+)/);
    return match ? match[1] : '';
  }

  async searchFilesRecursive(folderId: string): Promise<IFileGGDrive[]> {
    let resultFiles: IFileGGDrive[] = [];
    const folderQuery = `'${folderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'`;
    const fileQuery = `'${folderId}'+in+parents`;

    const { files: currentFiles } = await this.fetchFiles(fileQuery);

    resultFiles = [...resultFiles, ...currentFiles];

    const { files: subFolders } = await this.fetchFiles(folderQuery);

    for (const folder of subFolders) {
      const subFiles = await this.searchFilesRecursive(folder.id);
      resultFiles = [...resultFiles, ...subFiles];
    }

    return resultFiles;
  }

  async getListItemsTree(inp: GGDriveGetListItemsTreeFilter): Promise<FolderTreeItems[]> {
    const { folderId, isFolder = false, ignoreFolderIds = [] } = inp;
    const items = await this.getFolderData({ folderID: folderId });
    // logger.logInfo('GGDriveService -> getListItemsTree -> items: %j', items);
    const results: FolderTreeItems[] = [];

    for (const item of items.data) {
      const {
        id,
        mimeType,
        name,
        linkPreview,
        fileExtension,
        modifiedTime,
        thumbnailLink,
        size,
        iconLink,
      } = item;
      if (isFolder && item.mimeType !== 'folder') {
        continue;
      }

      if (ignoreFolderIds.includes(id)) {
        continue;
      }

      const itemData = {
        id,
        mimeType,
        name,
        linkPreview,
        fileExtension,
        modifiedTime,
        thumbnailLink,
        size,
        iconLink,
        children: [],
      };
      if (item.mimeType === 'folder') {
        const subTree = await this.getListItemsTree({
          folderId: id,
          isFolder,
          ignoreFolderIds,
        });
        // @ts-ignore
        itemData.children = subTree;
      }

      results.push(itemData);
    }

    return results;
  }

  async getAllFilesFromLink(link: string): Promise<FolderTreeItems[]> {
    logger.logInfo('GGDriveService -> getAllFilesFromLink -> link: %s', link);
    try {
      const folderId = this.getFolderIdFromLink(link) || '';
      const folders = await this.getListItemsTree({
        folderId,
      });

      return folders;
    } catch (error: any) {
      logger.logDebug('GGDriveService -> getAllFilesFromLink -> error: %s', error.message);
      return [];
    }
  }

  async getFolderPermissions(folderId: string): Promise<drive_v3.Schema$Permission[]> {
    try {
      const response = await this.GG_DRIVE.permissions.list({
        fileId: folderId,
        fields: 'permissions(id, type, emailAddress, role, displayName)',
      });

      // logger.logInfo(
      //   'GGDriveService -> getFolderPermissions -> permissions: %j',
      //   response.data.permissions
      // );
      return response.data.permissions || [];
    } catch (error) {
      logger.logError('GGDriveService -> getFolderPermissions -> error', error);
      throw error;
    }
  }

  async getPermissionsForFolderChildren(folderId: string): Promise<any[]> {
    logger.logInfo('GGDriveService -> getPermissionsForFolderChildren -> folderId: %j', folderId);
    const results: any[] = [];

    try {
      const fields = ['id', 'name', 'mimeType', 'parents'];
      const response = await this.GG_DRIVE.files.list({
        q: `'${folderId}' in parents`,
        fields: `files(${fields.join(',')})`,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
      });

      const children = response.data.files || [];

      // Parallelize the processing of each child
      const childPromises = children.map(async (child: any) => {
        let permissions: drive_v3.Schema$Permission[] = [];

        try {
          permissions = await this.getFolderPermissions(child.id);
        } catch (permErr) {
          logger.logError(
            'GGDriveService -> getPermissionsForFolderChildren -> permission fetch error',
            permErr
          );
        }

        const item: any = {
          fileId: child.id,
          fileName: child.name,
          mimeType: child.mimeType,
          permissions,
          children: [],
        };

        // If this is a folder, recurse
        if (child.mimeType === 'application/vnd.google-apps.folder') {
          item.children = await this.getPermissionsForFolderChildren(child.id);
        }

        return item;
      });

      const resolvedItems = await Promise.all(childPromises);
      results.push(...resolvedItems);

      return results;
    } catch (error) {
      logger.logError('GGDriveService -> getPermissionsForFolderChildren -> error', error);
      throw error;
    }
  }
}
