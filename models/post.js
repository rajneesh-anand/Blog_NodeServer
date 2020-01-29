const Mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const { Schema } = Mongoose;


const options = {
  separator: '-',
  lang: 'en',
  truncate: 120
};

Mongoose.plugin(slug, options);

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: { type: String, slug: 'title', unique: true },
    body: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
      },
    photo: {
        data: Buffer,
        contenType: String
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
        {
            text: String,
            created: { type: Date, default: Date.now },
            postedBy: { type: Schema.Types.ObjectId, ref: 'User' }
        }
    ]
});


module.exports = Mongoose.model('Post', postSchema);