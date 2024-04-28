import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const createFolder = async (folderPath: string) => {
    try {
        
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        
    } catch (err) {
        console.log("🚀 -------------------------------------------------------------🚀");
        console.log("🚀 ~ CreateFolder ~ err:", err);
    }
}

export const generateFileName = (fileName: string, extension: string | null = null): string => {
    const fileNameArray = fileName ? fileName.split('.') : [];
    const fileNameExtension = extension ? extension : fileNameArray[fileNameArray.length - 1];
    const fileNameWithoutExtension = fileName.replace(`.${fileNameExtension}`, '');
    const fileNameGenerated = `${fileNameWithoutExtension}_${uuidv4()}`;
    return `${fileNameGenerated}.${fileNameExtension}`;
}

export const generateFileNameWithoutExt = (): string => {
    const fileNameGenerated = `file-${uuidv4()}`;
    return fileNameGenerated;
}