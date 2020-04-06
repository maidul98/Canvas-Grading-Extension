let connection = require('../connection.js');
let JSZip = require("jszip");
const axios = require('axios');
var mkdirp = require('mkdirp');
const https = require('https');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const archiver = require('archiver')
const async = require('async');
var zipdir = require('zip-dir');
const { zip } = require('zip-a-folder');

var rimraf = require("rimraf"); // for removing a folder with contents

const config = {
    //TODO: Factor out bearer tokens into another file that isn't publicly accessible.
    headers: {
        Authorization: 'Bearer 9713~8gLsbC5WwTWOwqv8U3RPK4KK0wcgFThoufCz7fsCwXKsM00w9jKRcqFsbAo8HvJJ',
        'Accept': 'application/json',
    },
};

/**
 * This function zips up the folder to be sent back to user. Returns a promise.
 * @param {string} path_to_folder 
 * @param {string} zip_name 
 */
async function zipFolder(path_to_folder, zip_name) {
    return new Promise(async function (resolve, reject) {
        try {
            await zip(path_to_folder, `${path.join(__dirname, '../temp_bulk_downloads')}/${zip_name}.zip`);
        } catch (error) {
            reject();
        }
    });
}

/**
 * Given a URL, it will download a file on to the into the filestream in the filepath. Returns 
 * true if files have been downloaded and zipped. Throws errors otherwise.
 * @param {object} attachment 
 * @param {stream} filestream 
 * @param {string} filepath
 * @param {string} bulk_folder_path 
 * @param {string} zip_name 
 */
async function downloadHelper(attachment, filestream, bulk_folder_path, folder_name) {
    try {
        let response = await fetch(attachment.url)
        let data = await response.body
        data.pipe(filestream);
        //await zipFolder(bulk_folder_path, folder_name);
        return true
    } catch (error) {
        throw "Something went wrong when zipping or downloading the file"
    }
}

/**
 * This function downloads submissions given user_ids of students, assignment_id and a download path url
 * and returns true if all attchments were downloaded and zipped. Error is thrown otherwise. 
 * @param {string} batchDownloadPath 
 * @param {array} user_ids 
 * @param {int} assignment_id 
 * @param {string} folder_name 
 */
async function createDownloadSubmission(batchDownloadPath, user_ids, assignment_id, folder_name) {
    return new Promise(async (resolve, reject) => {
        try {
            let parentPath = mkdirp.sync(batchDownloadPath)
            user_ids.map(async (user_id) => {
                const user_folder_path = mkdirp.sync(`${parentPath}/${user_id}`);
                const submission = await axios.get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${assignment_id}/submissions/${user_id}`, config)
                if (submission.data.attachments) {
                    submission.data.attachments.map(async (attachment) => {
                        const fileStream = fs.createWriteStream(`${user_folder_path}/${attachment.filename}`);
                        await downloadHelper(attachment, fileStream, parentPath, folder_name)
                    })
                }
            })
            resolve()
            return true

        } catch (error) {
            reject(error)
            throw 'something went wrong'
        }
    })

}

async function createDownloadSubmissionAnsh(batchDownloadPath, user_ids, assignment_id, folder_name) {
    return new Promise(async (resolve, reject) => {
        try {
            let parentPath = mkdirp.sync(batchDownloadPath)
            user_ids.map(async (user_id) => {
                const user_folder_path = mkdirp.sync(`${parentPath}/${user_id}`);
                const submission = await axios.get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${assignment_id}/submissions/${user_id}`, config)
                if (submission.data.attachments) {
                    submission.data.attachments.map(async (attachment) => {
                        const fileStream = fs.createWriteStream(`${user_folder_path}/${attachment.filename}`);
                        await downloadHelper(attachment, fileStream, parentPath, folder_name)
                    })
                }
            })

        } catch (error) {
            reject(error)
            throw 'something went wrong'
        }
    })

}

/**
 * This function, 
 * @param {int} req.body.assignment_id
 * @param {int} req.body.grader_id 
 * @param {array} req.body.user_ids
 */
module.exports.downloadSubmissions = async (req, res) => {
    try {
        let folder_name = `${req.body.assignment_id}-${req.body.grader_id}`
        let batchDownloadPath = `temp_bulk_downloads/assignemnt-${folder_name}`;

        if (fs.existsSync(batchDownloadPath) && fs.lstatSync(batchDownloadPath).isDirectory()) {
            rimraf.sync(batchDownloadPath);
            await createDownloadSubmissionAnsh(batchDownloadPath, req.body.user_ids, req.body.assignment_id, folder_name)
                .then(_ => {
                    console.log('wtf is happening')
                    res.send('done')
                })
            //res.send('done!')
        } else {
            await createDownloadSubmissionAnsh(batchDownloadPath, req.body.user_ids, req.body.assignment_id, folder_name)
                .then((_ => res.send('done')))
        }
    } catch (error) {
        res.send('Error!')
    }
}