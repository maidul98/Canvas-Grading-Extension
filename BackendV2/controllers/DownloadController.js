let connection = require('../connection.js');
const axios = require('axios');
var mkdirp = require('mkdirp');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');

var rimraf = require("rimraf"); // for removing a folder with contents
const { zip } = require('zip-a-folder');

const config = {
    //TODO: Factor out bearer tokens into another file that isn't publicly accessible.
    headers: {
        Authorization: 'Bearer 9713~8gLsbC5WwTWOwqv8U3RPK4KK0wcgFThoufCz7fsCwXKsM00w9jKRcqFsbAo8HvJJ',
        'Accept': 'application/json',
    },
};

/**
 * 
 * @param {*} attachment 
 * @param {*} user_folder_path 
 */
function downloadAttachment(attachment, user_folder_path){
    return new Promise(function(resolve, reject) {
        try{
            const fileStream = fs.createWriteStream(`${user_folder_path}/${attachment.filename}`);
            fetch(attachment.url).then((response)=>{
                let data = response.body
                data.pipe(fileStream).on('finish', async ()=>{
                    resolve() 
                });
            })
        }catch(error){
            reject(error)
        }
    });
}

/**
 * 
 * @param {*} user_id 
 * @param {*} assignment_id 
 * @param {*} parentPath 
 */
async function getAllUserAttachments(user_id, assignment_id, parentPath){
    try{
        const user_folder_path = mkdirp.sync(`${parentPath}/${user_id}`);
        const submission = await axios.get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${assignment_id}/submissions/${user_id}`, config)
        if (submission.data.attachments) {
            return await Promise.all(submission.data.attachments.map(attachment =>
                downloadAttachment(attachment, user_folder_path)
            )) 
        }
        return
    }catch(error){
        throw error
    }
}

/**
 * 
 * @param {*} batchDownloadPath 
 * @param {*} user_ids 
 * @param {*} assignment_id 
 */
async function createDownloadSubmission(batchDownloadPath, user_ids, assignment_id) {
    try{
        let parentPath = await mkdirp(batchDownloadPath)
        return await Promise.all(user_ids.map(user_id => 
            getAllUserAttachments(user_id, assignment_id, parentPath)
        ))
    }catch(error){
        throw error
    }

}

/**
 * 
 */
module.exports.downloadSubmissions = async (req, res) => {
    try{
        let folder_name = `${req.body.assignment_id}-${req.body.grader_id}`
        let batchDownloadPath = `temp_bulk_downloads/assignemnt-${folder_name}`;
    
        if (fs.existsSync(batchDownloadPath) && fs.lstatSync(batchDownloadPath).isDirectory()) {
            rimraf.sync(batchDownloadPath);
            await createDownloadSubmission(batchDownloadPath, req.body.user_ids, req.body.assignment_id)
            await zip(`${batchDownloadPath}/`, `${path.join(__dirname, '../temp_bulk_downloads/achieves')}/${folder_name}.zip`);
            res.download(`${path.join(__dirname, '../temp_bulk_downloads/achieves')}/${folder_name}.zip`)
        } else {
            await createDownloadSubmission(batchDownloadPath, req.body.user_ids, req.body.assignment_id)
            await zip(`${batchDownloadPath}/`, `${path.join(__dirname, '../temp_bulk_downloads/achieves')}/${folder_name}.zip`);
            res.download(`${path.join(__dirname, '../temp_bulk_downloads/achieves')}/${folder_name}.zip`)
        }
    }catch(error){
        res.send('Error!')
    }
}