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

function downloadHelper(attachment, filestream, filepath) {
    return new Promise((resolve, reject) => {
        https.get(attachment.url, function (response) {
            response.pipe(filestream);
            filestream.on('finish', function () {
                filestream.close();
                console.log('filestream closed')
                resolve();
            });
        }).on('error', function (err) {
            console.log(err)
            fs.unlink(`${filepath}/${attachment.filename}`);
            reject(reject);
        });;
    })
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
function createDownloadSubmission(batchDownloadPath, user_ids, assignment_id, zipFolder, graderFolderName) {
    //make parent folder
    return new Promise((resolve, reject) => {
        console.log('started method')
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
                                            console.log('downloading file')
                                            downloadHelper(attachment, fileStream, filePathForUser)
                                                .then(async function () {
                                                    console.log('adding file to zip')
                                                    await zipFolder.file(`${graderFolderName}/${user_id}/${attachment.filename}`, fs.readFileSync(`${filePathForUser}/${attachment.filename}`));
                                                })
                                                .catch(err => console.log(err));
                                        })
                                    }
                                })
                                .catch(error => {
                                    console.log(error);
                                    reject(error)
                                })
                        })
                        .catch(error => {
                            console.log(error);
                            reject(error)
                        })
                })
            })
            .then(_ => {
                resolve(true)
            })
            .catch(error => {
                console.log(error);
                reject(error)
            })
    })

}

exports.downloadSubmissions = function (req, res) {
    let batchDownloadPath = `temp_bulk_downloads/assignemnt-${req.body.assignment_id}-${req.body.grader_id}`;
    let zip = new JSZip();
    let graderFolderName = `assignment-${req.body.assignment_id}-${req.body.grader_id}`
    zip.folder(graderFolderName);

    if (fs.existsSync(batchDownloadPath) && fs.lstatSync(batchDownloadPath).isDirectory()) {
        fs.remove(batchDownloadPath).then(function () {
            // if (createDownloadSubmission(batchDownloadPath, req.body.user_ids, req.body.assignment_id)) {
            //     res.send('done downloading')
            // }
            createDownloadSubmission(batchDownloadPath, req.body.user_ids, req.body.assignment_id, zip, graderFolderName)
                .then(async function (r) {
                    var content = await zip.generateAsync({ type: "nodebuffer" });
                    await fs.writeFile(`${graderFolderName}.zip`, content, function (err) {
                        if (err) throw err;
                    });
                    res.send('done downloading')
                })
                .catch(err => console.log(err))

        })
    } else {
        createDownloadSubmission(batchDownloadPath, req.body.user_ids, req.body.assignment_id, zip, graderFolderName)
            .then(_ => res.send('done downloading'))
            .catch(err => console.log(err))
    }
}

