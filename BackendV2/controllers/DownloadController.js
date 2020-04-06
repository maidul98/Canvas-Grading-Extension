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
 * This function downloads a single attachment and savesit to its users folder. 
 * Throws error otherwise
 * @param {obj} attachment 
 * @param {string} user_folder_path 
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
 * This fetches all attachments of a single user and 
 * calls downloadAttachment() for each attachment to be 
 * downloaded into the users folder.
 * @param {int} user_id 
 * @param {int} assignment_id 
 * @param {string} parentPath 
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
 * This function downloads all attachments for every user 
 * gievn a assignment_id into folders named by user_id
 * @param {string} batchDownloadPath 
 * @param {array} user_ids 
 * @param {int} assignment_id 
 */
async function downloadAllAttachmentsForAllUser(batchDownloadPath, user_ids, assignment_id) {
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
 * This function deletes a folder fully and returns true 
 * if it has done so successfully or false otherwise.
 * @param {string} path 
 */
function deleteFolder(path){
    try{
        rimraf.sync(path)
        return true
    }catch(e){
        console.log(e) 
    }
}

/**
 * This function deletes a file fully and returns true 
 * if it has done so successfully or false otherwise.
 * @param {string} path 
 */
function deleteFile(path){
    try{
        fs.unlink(path, (err) => {
            if (err) throw err;
        })
        return true
    }catch(e){
        console.log(e) 
    }
}

/**
 * 
 */
function deletePreviousBulkSubmission(){
    const time_remaining = (date_provided) => new Date(date_provided) - new Date();
    const timer = setTimeout( () => deleteFile(req.body.file), time_remaining (req.body.date));
     timeOuts.push(timer);
}

/**
 * Route
 */
module.exports.downloadSubmissions = async (req, res) => {
    try{
        let folder_name = `${req.body.assignment_id}-${req.body.grader_id}`
        let bulkSubmissionsPath = `temp_bulk_downloads/assignemnt-${folder_name}`;
        let zip_file_path = `${path.join(__dirname, '../temp_bulk_downloads/achieves')}/${folder_name}.zip`

        if (fs.existsSync(zip_file_path)) { 
            if(deleteFile(zip_file_path) & deleteFolder(bulkSubmissionsPath)){
                console.log('delete both')
                await downloadAllAttachmentsForAllUser(bulkSubmissionsPath, req.body.user_ids, req.body.assignment_id)
                await zip(`${bulkSubmissionsPath}/`, zip_file_path);
                res.download(`${path.join(__dirname, '../temp_bulk_downloads/achieves')}/${folder_name}.zip`)
            }else{
                console.log('not delete')
            }
        }else{
            await downloadAllAttachmentsForAllUser(bulkSubmissionsPath, req.body.user_ids, req.body.assignment_id)
            await zip(`${bulkSubmissionsPath}/`, zip_file_path);
            res.download(`${path.join(__dirname, '../temp_bulk_downloads/achieves')}/${folder_name}.zip`)
        }

    }catch(error){
        res.send(error)
    }
}