'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');
var Article = require('../models/article');

var controller = 
{
    save: (req, res) => {

        // Cargamos los datos que recibimos por el POST

        var params = req.body;

        // Validamos los datos, y si no dará error
        
        try{
          var validate_title = !validator.isEmpty(params.title);
          var validate_content = !validator.isEmpty(params.content);

        } catch(err){
            return res.status(200).send({
                message: 'Faltan datos por introducir'
            })
        };

        // Creamos y guardamos el objeto una vez validado
        
        if(validate_title && validate_content){
            var article = new Article();
            article.title = params.title;
            article.content = params.content;

            if(params.image){
                article.image = params.image;
            } else {
                article.image = null;
            }

            article.save((error, articleStored) => {
                if(error || !articleStored){
                    return res.status(404).send({
                        ststus: 'error',
                        message: 'El artículo no se ha guardado'
                    })
                } else {
                    return res.status(200).send({
                        status: 'success',
                        article: articleStored
                    })
                }
            })} else {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos'
            })
        }
    },
    getArticles: (req, res) => {
        var query = Article.find({});
        var last = req.params.last;

        if(last || last != undefined){
            query.limit(5);
        };

        query.sort('-_id').exec((error, articles)=>{
            if(error){
                return res.status(500).send({
                    status:'Error',
                    message:'Ha ocurrido un error'
                })
            }
            if(!articles){
                return res.status(404).send({
                    status:'Error',
                    message:'No hay artículos para mostrar'
                })
            }
            return res.status(200).send({
                status:'Success',
                articles
            })
        })

    },

    getArticle: (req, res) => {

        var articleId = req.params.id;

        if(!articleId || articleId == null){
            return res.status(404).send({
                status: 'Error',
                message: 'El artículo no existe'
            })
        }

        Article.findById(articleId, (err, article) => {
            if(err || !article){
                return res.status(404).send({
                    status: 'Error',
                    message: 'El artículo no existe'
                })
            }

            return res.status(200).send({
                status: 'Success',
                article
            })
        })
    },

    updateArticle: (req, res) => {

        var articleId = req.params.id;

        var params = req.body;

        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch (error) {
            return res.status(404).send({
                status: 'Error',
                mensaje: 'Faltan datos por enviar'
            })
        }

        if(validate_title && validate_content){
            Article.findOneAndUpdate({_id: articleId}, params, {new: true}, (error, articleUpdated)=> {
                if(error){
                    return res.status(500).send({
                        status: 'Error',
                        message: 'No se pudo actualizar el artículo'
                    })
                }

                if(!articleUpdated){
                    return res.status(404).send({
                        status: 'Error',
                        message: 'No se encuentra el artículo'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                })
            })
        } else {
            return res.status(400).send({
                status: 'Error',
                message: 'Los datos no son correctos'
            })
        }
    },

    deleteArticle: (req, res) => {

        var articleId = req.params.id;

        Article.findByIdAndDelete({_id: articleId}, (error, articleDeleted) => {

            if(error){
                return res.status(500).send({
                    status: 'Error',
                    message: 'No se ha podido eliminar el artículo' 
                })
            };

            if(!articleDeleted){
                return res.status(404).send({
                    status: 'Error',
                    message: 'No se ha encontrado el artículo, posiblemente no exista' 
                })
            };

            return res.status(200).send({
                status: 'Success',
                article: articleDeleted
            })
        })
    },

    upload: (req, res) => {

        var file_name = 'Imagen no subida';

         if(!req.files){
             return res.status(404).send({
                 status: 'Error',
                 file_name
             })         
        };
       
        var file_path = req.files.file0.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];
        var extension_split = file_name.split('.');
        var file_ext = extension_split[1]

        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'Error',
                    message: 'La extensión no es valida'
                })
            })
        } else {

            var articleId = req.params.id;

            if(articleId){

            Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new: true}, (error, articleUpdated) =>{
                
                if(error || !articleUpdated){
                    return res.status(404).send({
                        status: 'Error',
                        message: 'La imagen no pudo actualizarse'
                    })
                };

                return res.status(200).send({
                    status: 'Success',
                    article: articleUpdated
                })
            });
            } else {
                return res.status(200).send({
                    status: 'Success',
                    image: file_name,

                })
            }

        }

    },

    getImage: (req, res) => {

        var file = req.params.image;
        var file_path = './upload/articles/' + file;

        fs.exists(file_path, (exists)=>{
            if(exists){
                return res.sendFile(path.resolve(file_path));
            } else {
                return res.status(404).send({
                    status: 'Error',
                    message: 'La imagen no existe'
                })
            }
        })
    },

    search: (req, res) => {

        var searchString = req.params.search;

        Article.find({ "$or": [
            { "title": {"$regex": searchString, "$options": "i"}},
            { "content": {"$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date' , 'descending']])
        .exec((error, articles) => {

            if(error){
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error en la petición'
                })
            };

            if(!articles || articles.length <= 0){
                return res.status(404).send({
                    status: 'Error',
                    message: 'No hay artículos para mostrar'
                })
            };

            return res.status(200).send({
                status: 'Success',
                articles
            });
        })
    },
};

module.exports = controller;