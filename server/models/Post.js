import mongoose from 'mongoose';
import slugify from 'slugify';

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'A post must have a title'],
        trim: true,
        maxLength: [100, 'Title cannot be more than 100 characters.'],
    },
    slug : {
        type: String,
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Post content is required.']
    },
    excerpt: {
        type: String,
        maxLength: [300, 'Excerpt cannot be more than 300 characters.'],
        default: 'A short summary of the post...'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    category: {
        type: String,
        default: 'General'
    },
    tags: [String],
    isAI:{
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    publishedAt: Date,
}, {
    timestamps: {updatedAt: 'updatedAt'}
});

PostSchema.pre('save', async function(next) {
    if(this.isModified('title')){
        let baseSlug = slugify(this.title, {lower: true, strict: true});
        let slug = baseSlug;
        let counter = 1;

        while(await this.constructor.findOne({slug})){
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }

    if(this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = Date.now();
    }

    next();
});

PostSchema.index({title: 'text', content: 'text', tags: 'text'});

export default mongoose.model('Post', PostSchema);