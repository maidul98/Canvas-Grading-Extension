var AssignmentGrader = require('./grader-model');
import { shuffle, distribute } from './distribution.js';
var queries = require('../controllers/queries');

export function formMatchingMatrix(grader_array, submissions_array) {
    const len = submissions_array.length;

    if (len === 0) {
        console.log('There are currently no assignments to distribute.');
        return [];
    }

    var matrix = new Array(len).fill(0).map(() => new Array(2).fill(0));
    shuffle(submissions_array);

    var counter = 0;
    for (var j = 0; j < grader_array.length; j++) {
        num_assigned = grader_array[j].num_assigned;
        id = grader_array[j].grader_id;
        for (var i = counter; i < counter + num_assigned; i++) {
            matrix[i][0] = id;
        }
        counter += num_assigned;
    }

    for (var i = 0; i < len; i++)
        matrix[i][1] = submissions_array[i];

    return matrix;
}

export function runPipeline() {

    queries.get_grader_objects()
        .then(grader_array => {
            queries.get_unassigned_submissions()
                .then(submission_json => {
                    return submission_json.map(v => v.id);
                })
                .then(mapped => {
                    output_of_algo = distribute(mapped.length, grader_array);
                    matrix_of_pairs = formMatchingMatrix(mapped, output_of_algo);

                    //update submissions DB with matrix_of_pairs 
                    //update graders offsest with output_of_algo
                    queries.update_grader_entries(output_of_algo, function (err) {
                        if (err) console.log(err);
                    });
                    queries.assign_submissions_to_grader(matrix_of_pairs, function (err) {
                        if (err) console.log(err);
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
}





//TESTING 

//grader_id, weight, offset, num_assigned
grader_array =
    [new AssignmentGrader(1, 0, 0, 4),
    new AssignmentGrader(2, 0, 0, 6),
    new AssignmentGrader(3, 0, 0, 2),
    new AssignmentGrader(4, 0, 0, 1),
    new AssignmentGrader(5, 0, 0, 0),
    new AssignmentGrader(6, 0, 0, 5)];

submissions_array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

output = formMatchingMatrix(grader_array, submissions_array);
console.log(output);
