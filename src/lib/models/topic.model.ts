import mongoose, { Document, Schema } from 'mongoose';

interface Topic extends Document {
  name: string;
  type: string;
  data: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const topicSchema = new Schema<Topic>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const TopicModel = mongoose.model<Topic>('Topic', topicSchema);

export default TopicModel;
