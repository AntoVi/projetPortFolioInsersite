const Article = require('./../models/articleModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./factoryHandler');

exports.getAllArticles = factory.getAll(Article)
exports.getArticle = factory.getOne(Article)
exports.createArticle = factory.createOne(Article)
exports.updateArticle = factory.updateOne(Article);
exports.deleteArticle = factory.deleteOne(Article);