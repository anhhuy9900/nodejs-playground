import mongoose from 'mongoose';

class MongoDBConnection {
  private url: string;
  private client: typeof mongoose | null;

  constructor(url: string) {
    this.url = url;
    this.client = null;
  }

  async connect(): Promise<void> {
    try {
      this.client = await mongoose.connect(this.url);
      console.log('Connected to MongoDB successfully!');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

  disconnect(): void {
    try {
      if (this.client) {
        this.client.disconnect();
        console.log('Disconnected from MongoDB.');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }
}

export default MongoDBConnection;
