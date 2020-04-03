let connection = require('../connection.js');
let JSZip = require("jszip");
const axios = require('axios');
var mkdirp = require('mkdirp');
const https = require('https');
const fs = require('fs-extra');
const path = require('path');


const config = {
    //TODO: Factor out bearer tokens into another file that isn't publicly accessible.
    headers: {
      Authorization: 'Bearer 9713~8gLsbC5WwTWOwqv8U3RPK4KK0wcgFThoufCz7fsCwXKsM00w9jKRcqFsbAo8HvJJ',
      'Accept': 'application/json',
    },
  };

/**
 * This function downloads submissions given user_ids of students, assignment_id and a download path url
 * and returns the path to the zipped folder of these submissions.
 * @param batchDownloadPath 
 * batchDownloadPath is created by assignment_id-grader_id
 * @param user_ids 
 * the ids of the students who we are going to download the submissions for 
 * @param assignment_id 
 * the id of the assignment we are going to be downloading for
 */
function createDownloadSubmission(batchDownloadPath, user_ids, assignment_id){
    //make parent folder
    mkdirp(batchDownloadPath).then(parentPath=>{
        user_ids.map(user_id=>{
            //make folder where we are going to save the this users files 
            mkdirp(`${parentPath}/${user_id}`).then(filePathForUser =>{
                //get the list of attachments for a user
                axios.get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${assignment_id}/submissions/${user_id}`, config)
                .then(result => {
                    //for each attachment download the attachment and save 
                    if(result.data.attachments){
                        result.data.attachments.map(attachment =>{
                            //create a writeable file stream
                            const fileStream = fs.createWriteStream(`${filePathForUser}/${attachment.filename}`);
    
                            // make a request to download the file at hand
                            https.get(attachment.url, function(response) {
                                response.pipe(fileStream);
                                fileStream.on('finish', function() {
                                    fileStream.close(); 
                                });
                            }).on('error', function(err) { 
                                fs.unlink(`${filePathForUser}/${attachment.filename}`); 
                            });;
    
                        })
                    }

                }).catch(error =>{
                    return false
                    throw "there was an error on downloading a file"
                })
            }).catch(error =>{
                return false
                throw `there was an error when create a user folder within parent folder ${parentPath}/${user_id}`
            })
        });

        return true

    }).catch(error=>{
        return false
        throw "error when making parent folder"
    })
}




exports.downloadSubmissions = function (req, res){
    let batchDownloadPath = `temp_bulk_downloads/assignemnt-${req.body.assignment_id}-${req.body.grader_id}`;

    if(fs.existsSync(batchDownloadPath) && fs.lstatSync(batchDownloadPath).isDirectory()){
        fs.remove(batchDownloadPath).then(()=>{
            if(createDownloadSubmission(batchDownloadPath, req.body.user_ids, req.body.assignment_id)){
                res.send('done downloading')
            }
            
        })
    }else{
        if(createDownloadSubmission(batchDownloadPath, req.body.user_ids, req.body.assignment_id)){
            res.send('done downloading')
        }
    }
}

