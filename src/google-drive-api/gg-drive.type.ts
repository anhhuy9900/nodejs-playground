export interface IQueryFolder {
  folderID?: string;
}

export interface IQueryFolderList {
  folderIds?: string[];
}

export interface IUploadFile {
  folderId: string;
  file: any;
  accessToken?: string;
}

export interface ICreateFolder {
  folderName: string;
  folderId: string;
}

export interface IRenameFolder {
  folderName: string;
  folderId: string;
  isFolder: boolean;
  parentId?: string;
}

export interface IDeleteFolderFile {
  folderId: string;
  isFolder?: boolean;
}

export interface IQuerySearchFolder {
  folderID?: string;
  searchText?: string;
}

export interface IFolderDetail {
  name: string;
  kind: string;
  fileExtension: string;
  mimeType: string;
  thumbnailLink: string;
  lastModifyingUser: string;
  size: string | number;
  id: string;
  modifiedTime: string;
  documentId: string;
  linkPreview?: string;
  iconLink: string;
}

export interface IResponseGetFolder {
  data: IFolderDetail[];
  detailFolder: IFolderDetail | null;
}

export interface IResGGDrive {
  files: IFileGGDrive[];
}

export interface IFileGGDrive {
  kind: string;
  fileExtension?: string;
  mimeType: string;
  thumbnailLink?: string;
  lastModifyingUser: LastModifyingUser;
  size?: string;
  id: string;
  name: string;
  modifiedTime: string;
}

export interface LastModifyingUser {
  displayName: string;
  kind: string;
  me: boolean;
  permissionId: string;
  emailAddress: string;
  photoLink: string;
}

export interface ISyncFileFolder {
  folderId: string;
  folderName: string;
}

export interface IResSyncFileFolder {
  success: boolean;
  targetFolderId: string;
  message: string;
}

export interface Formats {
  large: Large;
  small: Small;
  medium: Medium;
  thumbnail: Thumbnail;
}

export interface Large {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: any;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface Small {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: any;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface Medium {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: any;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface Thumbnail {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: any;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface IFile {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string;
  caption: string;
  width: number;
  height: number;
  formats: Formats;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: any;
  provider: string;
  provider_metadata: any;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: any;
  folder: any;
  isUrlSigned: boolean;
}

export interface IFolder {
  createdAt: string;
  id: number;
  documentId: string;
  name: string;
  pathId: number;
  path: string;
  updatedAt: string;
  publishedAt: string;
  locale: any;
  children: Children;
  files: Files;
}

export interface Children {
  count: number;
}

export interface Files {
  count: number;
}

export interface FolderTreeItems
  extends Pick<
    IFolderDetail,
    'id' | 'name' | 'mimeType' | 'linkPreview' | 'fileExtension' | 'modifiedTime' | 'iconLink'
  > {
  children?: FolderTreeItems[];
}

export interface AssetGGDrive {
  gameConfigId: string | Record<string, any>;
  folderId: string;
  gameContent: AssetGameContentGGDrive;
  gameConfig: AssetGameConfigGGDrive;
}

export type GGDriveGetListItemsTreeFilter = {
  folderId: string;
  isFolder?: boolean;
  ignoreFolderIds?: string[];
};

export interface AssetGameConfigGGDrive {
  folderId: string;
  properties: AssetGamePropertyGGDrive[];
}

export interface AssetGamePropertyGGDrive {
  type: string;
  folderId: string;
}

export interface AssetGameContentGGDrive {
  folderId: string;
  properties: AssetGamePropertyGGDrive[];
}

export interface GameContentChildGGDrive {
  iconFolderId: string;
  gameOverviewFolderId: string;
  videoFolderId: string;
}
