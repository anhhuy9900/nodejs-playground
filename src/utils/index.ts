import fs from 'fs';
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