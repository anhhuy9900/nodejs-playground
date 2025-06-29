import { load } from 'ts-dotenv';
import { resolve } from 'path';

export default load(
  {
    LOG_LEVEL: {
      type: String,
      default: 'debug',
    },
    GG_API_KEY: {
      type: String,
      default: 'AIzaSyAQsp4ox4_jc5YGxt2Cj6W6CGKLTjjwvZY', // nhahuy19900@gmail.com
      // default: 'AIzaSyAULavk58KhVs7DCMOOOBGGKAVGnJAye4k', // huy.nguyen@joytrekk.com
    },
    GG_FOLDER_ID: {
      type: String,
      default: '1eFMAG7XPK5Y9Xycl0sLiN9EjI8bOpk82',
    },
  },
  { path: resolve(__dirname, '../../../.env') }
);
