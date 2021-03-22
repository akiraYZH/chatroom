let express = require('express');
let router = express.Router();
let path = require("path");
let fs = require("fs");
let config = require("../config.json");
let resource =config.RESOURCE;
let ENV = config.ENV;

let { IMAGE_URL_PREFIX, IMAGE_PATH} = resource;

/* GET home page. */
router.get('/avatars', function(req, res, next) {
    
        let imageFolderPath = path.join(__dirname, "../", IMAGE_PATH);
        let imageReg = /(\.jpg|\.png|\.jpeg|\.gif|\.webp)$/i; //for filtering all images files
        let dirs = [];

        fs.readdir(imageFolderPath , function(err, files){
            
            try{
                if(files.length){
                    for (let i=0; i<files.length; i++)
                    {
                        if(imageReg.test(files[i])){
                            if(process.env.NODE_ENV === ENV.DEV){
                                dirs.push(ENV.DEV_URL + IMAGE_URL_PREFIX + files[i])
                            } else {
                                dirs.push(IMAGE_URL_PREFIX + files[i]);
                            }
                            

                        }
                    }
                    res.send(dirs);
                } else {
                    res.status(500).json({error: "Not found"});
                }
                
            } catch (error){
                console.log(error);
                return res.status(500).json({error: error.toString()});
                
            }
        });
   
    
    

});

module.exports = router;
