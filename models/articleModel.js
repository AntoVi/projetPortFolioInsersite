const mongoose = require('mongoose')
const slugify = require('slugify')


const articleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Un article doit avoir un nom'],
        trim: true
    },
    slug: String,
    price: {
        type: Number, 
        required: [true, 'un article doit avoir un prix']
    }, 
    description: {
        type: String, 
        trim: true
    },
    taille: {
        type: String,
        required: [true, 'Un article doit avoir une taille'],
        trim: true
    }, 
    image: String 
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
)

articleSchema.index({ price: 1 })
articleSchema.index({ slug: 1 })

articleSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;