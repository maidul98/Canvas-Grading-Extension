const axios = require('axios');
var mkdirp = require('mkdirp');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
var rimraf = require('rimraf');
const { zip } = require('zip-a-folder');
const canvas = require('../models/Canvas');

/**
 * This function downloads a single attachment and savesit to its users folder. 
 * Throws error otherwise
 * @param {obj} attachment 
 * @param {string} user_folder_path 
 */
function downloadAttachment(attachment, user_folder_path) {
    return new Promise(function (resolve, reject) {
        try {
            const fileStream = fs.createWriteStream(`${user_folder_path}/${attachment.filename}`);
            fetch(attachment.url).then((response) => {
                let data = response.body;
                data.pipe(fileStream).on('finish', async () => {
                    resolve();
                });
            });
        } catch (error) {
            reject(error);
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
async function getAllUserAttachments(user_id, net_id, assignment_id, parentPath, canvasReqConfig) {
    try {
        const user_folder_path = mkdirp.sync(`${parentPath}/${net_id}`);
        const submission = await axios.get(`https://canvas.cornell.edu/api/v1/courses/${canvasReqConfig.course_id}/assignments/${assignment_id}/submissions/${user_id}`, canvasReqConfig.token);
        if (submission.data.attachments) {
            return await Promise.all(submission.data.attachments.map(attachment =>
                downloadAttachment(attachment, user_folder_path)
            ));
        }
        return;
    } catch (error) {
        throw error;
    }
}

/**
 * This function downloads all attachments for every user 
 * gievn a assignment_id into folders named by user_id
 * @param {string} batchDownloadPath 
 * @param {array} user_ids 
 * @param {int} assignment_id 
 */
async function downloadAllAttachmentsForAllUser(batchDownloadPath, user_ids, assignment_id, canvasReqConfig) {
    try {
        let parentPath = await mkdirp(batchDownloadPath);
        return await Promise.all(user_ids.map((user) => {
            return getAllUserAttachments(user[0], user[1], assignment_id, parentPath, canvasReqConfig);
        }
        ));
    } catch (error) {
        throw error;
    }

}


/**
 * This function deletes a folder fully and returns true 
 * if it has done so successfully or false otherwise.
 * @param {string} path 
 */
function deleteFolder(path) {
    try {
        rimraf.sync(path);
    } catch (e) {
        console.log(e);
        return;
    }
}

/**
 * This function deletes a file fully and returns true 
 * if it has done so successfully or false otherwise.
 * @param {string} path 
 */
function deleteFile(path) {
    try {
        fs.unlink(path);
    } catch (e) {
        console.log(e);
        return;
    }
}

/**
 * Computes the delay in milliseconds
 * @param {int} minutes The number of minutes the delay is required to last
 */
function computeTimeout(minutes) {
    return minutes * 60000;
}

/**
 * Route
 */
module.exports.downloadSubmissions = async (req, res) => {
    try {
        let canvasReqConfig = await canvas.getCanvasReqConfig(req.user.id);

        let folder_name = `${req.body.assignment_id}-${req.user.id}`;
        let bulkSubmissionsPath = `temp_bulk_downloads/assignment-${folder_name}`;
        let zip_file_path = `${path.join(__dirname, '../temp_bulk_downloads')}/${folder_name}.zip`;
        if (!fs.existsSync('temp_bulk_downloads')) {
            await mkdirp('temp_bulk_downloads');
        }

        const timeout = computeTimeout(1); // 2 minutes for now
        if (fs.existsSync(zip_file_path)) {
            deleteFile(zip_file_path);
            deleteFolder(bulkSubmissionsPath);
            await downloadAllAttachmentsForAllUser(bulkSubmissionsPath, req.body.user_ids, req.body.assignment_id, canvasReqConfig);
            await zip(`${bulkSubmissionsPath}/`, zip_file_path);
            res.setHeader('content-type', 'application/zip');
            fs.createReadStream(zip_file_path).pipe(res).on('finish', function () {
                setTimeout(function () {
                    deleteFile(zip_file_path);
                    deleteFolder(bulkSubmissionsPath);
                }, timeout);
            });

        } else {
            await downloadAllAttachmentsForAllUser(bulkSubmissionsPath, req.body.user_ids, req.body.assignment_id, canvasReqConfig);
            await zip(`${bulkSubmissionsPath}/`, zip_file_path);
            res.setHeader('content-type', 'application/zip');
            fs.createReadStream(zip_file_path).pipe(res).on('finish', function () {
                setTimeout(function () {
                    deleteFile(zip_file_path);
                    deleteFolder(bulkSubmissionsPath);
                }, timeout);
            });
        }

    } catch (error) {
        if(error.type == 'CGE'){
            res.status(400).send(error.message);
        }else{
            res.status(500).send('Something went wrong, please try again later');
        }
    }
};