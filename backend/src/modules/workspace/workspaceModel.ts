import mongoose, {Schema} from "mongoose";
import { IWorkspace } from "../../types";
import { timeStamp } from "node:console";

const workspaceSchema = new Schema<IWorkspace>(
    {
        name : {
             type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
        },
        description : {
            type: String,
      trim: true,
      maxlength: 500,
      default: null,

        },
        owner : {
            type: String,
      required: [true, 'Owner is required'],
      index: true,

        }, 
    color : {
        type: String,
      default: '#6366f1',
    },
    icon : {
        type: String,
      default: '>',
    },
    
        documentCount :{
             type: Number,
      default: 0,
        },
        isArchived : {
             type: Boolean,
      default: false,
      index: true,
        }
    
    },
    
)

//indexing
workspaceSchema.index({owner : 1, isArchived : 1});
workspaceSchema.index({owner : 1, createdAt : -1});

//function for clean output
workspaceSchema.set('toJSON', {
    transform : (_doc, ret : any) => {
        delete ret.__v;
        return ret;

    }
});

const Workspace = mongoose.model<IWorkspace>('Workspace', workspaceSchema);
export default Workspace ;