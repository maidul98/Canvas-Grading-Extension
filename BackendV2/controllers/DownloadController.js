let connection = require('../connection.js');
let JSZip = require("jszip");
const axios = require('axios');
var mkdirp = require('mkdirp');
const https = require('https');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');

var zipdir = require('zip-dir');

const config = {
    //TODO: Factor out bearer tokens into another file that isn't publicly accessible.
    headers: {
        Authorization: 'Bearer 9713~8gLsbC5WwTWOwqv8U3RPK4KK0wcgFThoufCz7fsCwXKsM00w9jKRcqFsbAo8HvJJ',
        'Accept': 'application/json',
    },
};

function zipFile(path_to_folder, zip_name) {
    zipdir(path_to_folder, { saveTo: `${path.join(__dirname, '../temp_bulk_downloads')}/${zip_name}.zip`, each: path => console.log("added!") }, function (err, buffer) {
        console.log('Zipping')
    });
}

/**
 * Given a URL, it will download a file from the URL into the filestream 
 * @param {*} url 
 * @param {*} filestream 
 * @param {*} filepath
 * @param {*} bulk_folder_path 
 * @param {*} zip_name 
 */
function downloadHelper(attachment, filestream, filepath, bulk_folder_path, folder_name) {
    fetch(attachment.url)
        .then(res => {
            res.body.pipe(filestream);
            zipFile(bulk_folder_path, folder_name);
        }).catch(() => {
            throw 'Something went wrong when writing the file to disk'
        });
}

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
function createDownloadSubmission(batchDownloadPath, user_ids, assignment_id, folder_name) {
    mkdirp(batchDownloadPath)
        .then(parentPath => {
            user_ids.map(user_id => {
                //make folder where we are going to save the this users files 
                mkdirp(`${parentPath}/${user_id}`)
                    .then(filePathForUser => {
                        //get the list of attachments for a user
                        axios
                            .get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${assignment_id}/submissions/${user_id}`, config)
                            .then(result => {
                                //for each attachment download the attachment and save 
                                if (result.data.attachments) {
                                    result.data.attachments.map(function (attachment) {
                                        //create a writeable file stream
                                        const fileStream = fs.createWriteStream(`${filePathForUser}/${attachment.filename}`);
                                        downloadHelper(attachment, fileStream, filePathForUser, parentPath, folder_name)
                                    })
                                }
                            })
                            .catch(error => {
                                console.log(error);
                            })
                    })
                    .catch(error => {
                        console.log(error);
                    })
            })
        })
        .then(() => {

        })
        .catch(error => {
            console.log(error);
            reject(error)
        })

}

exports.downloadSubmissions = function (req, res) {
    let folder_name = `${req.body.assignment_id}-${req.body.grader_id}`
    let batchDownloadPath = `temp_bulk_downloads/assignemnt-${folder_name}`;

    if (fs.existsSync(batchDownloadPath) && fs.lstatSync(batchDownloadPath).isDirectory()) {
        fs.remove(batchDownloadPath).then(function () {
            createDownloadSubmission(batchDownloadPath, req.body.user_ids, req.body.assignment_id, folder_name)
        })
    } else {
        createDownloadSubmission(batchDownloadPath, req.body.user_ids, req.body.assignment_id, folder_name)
    }
}

