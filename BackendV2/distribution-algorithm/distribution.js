var AssignmentGrader = require('./grader-model');

/**
 * Shuffles the input array [a], in place
 * @param {Array} a: The array to be shuffled
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Precondition: The minimum offset among all graders must be less than or 
 * equal to 1000000. 
 * Normalizes offsets such that the least offset equals 0; and
 * grader.offset = number of assignments that grader [grader] is behind on.
 * Returns the updated [graderArray] with updated offset values. 
 * @param {Array} graderArray: 1D array of AssignmentGrader objects, which 
 * represent all of the graders. 
 */
function normalize_offset(graderArray) {
    let min = 1000000;

    for (let i = 0; i < graderArray.length; i++)
        min = Math.min(graderArray[i].offset, min);

    for (let i = 0; i < graderArray.length; i++)
        graderArray[i].decrementOffset(min);

    return graderArray;
}

/**
 * Precondition: The sum of each grader's [dist_num_assigned] value must equal  
 * the length of [submission_array]. 
 * Randomly assigns each grader from [grader_array] exactly [dist_num_assigned] 
 * submissions from [submission_array] to grade. 
 * Returns a mapping from grader ID to submission ID. 
 * @param {Array} grader_array: 1D array of AssignmentGrader objects, which 
 * represent all of the graders. 
 * @param {Array} submissions_array: 1D Array of submission ID's
 */
function formMatchingMatrix(grader_array, submissions_array) {
    const len = submissions_array.length;

    var matrix = new Array(len).fill(0).map(() => new Array(2).fill(0));
    shuffle(submissions_array);

    var counter = 0;
    for (let j = 0; j < grader_array.length; j++) {
        assign = grader_array[j].dist_num_assigned;
        id = grader_array[j].grader_id;
        for (var i = counter; i < counter + assign; i++) {
            matrix[i][0] = id;
        }
        counter += assign;
    }

    for (let i = 0; i < len; i++)
        matrix[i][1] = submissions_array[i];

    return matrix;
}




/**
 * Main function that assigns each grader in [graderArray]  the number of submissions 
 * they should grade for a particular assignment, while ensuring no grader is assigned 
 * more than their cap. 
 * Returns [graderArray] with normalized [offset] values, [num_assigned] representing
 * their updated total number of assigned submissions for this assignment, and 
 * [dist_num_assigned] representing the number of newly assigned submissions in 
 * this round of distribution. 
 * @param {Number} num_of_submissions: Number of submissions that need to be distributed
 * @param {Array} graderArray: 1D array containing AssignmentGrader objects
 */
function main_distribute(num_of_submissions, graderArray) {

    //initial distribution 
    //only offset & num_assigned should be altered 
    graderArray = distribute(num_of_submissions, graderArray);

    let left_to_distribute = 0;

    //checking if the any grader's num_assigned value exceeds their cap 
    for (let i = 0; i < graderArray.length; i++) {

        surplus = graderArray[i].num_assigned - graderArray[i].cap;

        if (surplus > 0) {
            graderArray[i].decrementNumAssigned(surplus);
            graderArray[i].incrementOffset(surplus);
            left_to_distribute += surplus;
        }
    }


    graderArray = normalize_offset(graderArray);

    //sort graders in order of worst to best offsets 
    graderArray.sort(function (a, b) {
        if (b.offset === a.offset) return 0;
        return b.offset > a.offset ? 1 : -1;
    });

    //[left_to_distribute] represents the total number of submissions that now 
    //need to be distributed among available graders

    while (left_to_distribute !== 0) {

        for (let i = 0; i < graderArray.length; i++) {
            if (left_to_distribute === 0) break;
            let grader = graderArray[i];

            if (grader.num_assigned < grader.cap) {
                if (grader.weight > 0 || (grader.weight === 0 && grader.offset > 0)) {
                    grader.incrementNumAssigned(1);
                    grader.decrementOffset(1);
                    left_to_distribute--;
                }
            }
        }
    }

    //compute the current minimum offset among all graders after re-distribution
    let min_offset = 1000000;
    for (let i = 0; i < graderArray.length; i++)
        min_offset = Math.min(graderArray[i].offset, min_offset);

    //adjusting offsets for all graders with weight = 0 
    if (min_offset < 0) {
        graderArray = normalize_offset(graderArray);
        for (let i = 0; i < graderArray.length; i++) {
            if (graderArray[i].weight < 1) {
                graderArray[i].incrementOffset(min_offset);
            }
        }
    }

    for (let i = 0; i < graderArray.length; i++)
        graderArray[i].update_dist_num_assigned(graderArray[i].num_assigned - graderArray[i].dist_num_assigned);

    return normalize_offset(graderArray);
}



/**
 * Fairly distributes [num_of_submissions] submissions among all graders in 
 * [graderArray] according to their respective weights and offsets. 
 * @param {Number} num_of_submissions: Number of unassigned submissions that need to be distributed for a particular assignment
 * @param {Array} graderArray: An array of AssignmentGrader objects representing the set of all graders 
 */
function distribute(num_of_submissions, graderArray) {

    //sum of each grader's num_assigned BEFORE distribution 
    already_distributed = graderArray.reduce((total, element) => {
        return total + element.num_assigned;
    }, 0);


    //sort graders in order of worst to best offsets 
    //greater offset = worse offset
    //smaller offset = better offset 
    graderArray.sort(function (a, b) {
        if (b.offset === a.offset) return 0;
        return b.offset > a.offset ? 1 : -1;
    });


    //normalize offsets such that the least offset equals 0; and
    //grader.offset = relative number of assignments that grader [grader] is behind on.
    normalizing_constant = 0 - graderArray[graderArray.length - 1].offset;
    for (var i = 0; i < graderArray.length; i++)
        graderArray[i].incrementOffset(normalizing_constant);


    //computes sum of all graders' offsets
    totalOffset = graderArray.reduce((total, element) => {
        return total + element.offset;
    }, 0);


    if (num_of_submissions < totalOffset) {
        /* In this case, since the sum of the offsets exceeds the total number of 
        assignments that need to be distributed, there will be no assignments left
        to be distributed based on the graders' weights. */

        max_offset = graderArray[0].offset;
        //create a 2D int array called tiers 
        //dimensions: [max_offset] by [total number of graders] 
        tier = [...Array(max_offset)].map(x => Array(graderArray.length).fill(-1));

        for (var j = 0; j < graderArray.length; j++) {
            for (var i = 0; i < graderArray[j].offset; i++) {
                tier[i][j] = 1;
            }
        }

        //distributes assignments according to offsets (according to tiers) AND updates offsets 
        for (var i = tier.length - 1; i >= 0; i--) {
            var counter = 0;
            while (tier[i][counter] > 0) {
                if (num_of_submissions == 0) break;
                graderArray[counter].incrementNumAssigned(1);
                graderArray[counter].decrementOffset(1);
                counter++;
                num_of_submissions--;
            }
        }

    }
    else {
        /*In this case, assignments will be distirbuted according to offsets first, 
        and then according to weights. */

        //first, distribute [totalOffset] assignments according to offsets AND update offsets 
        for (var i = 0; i < graderArray.length; i++) {
            graderArray[i].incrementNumAssigned(graderArray[i].offset);
            graderArray[i].updateOffset(0);
        }

        //number of assignments to be distributed according to weights
        distBasedWeights = num_of_submissions - totalOffset;

        //computes total weight
        total_weight = graderArray.reduce((total, element) => {
            return total + element.weight;
        }, 0);

        //then, distribute [distBasedWeights] assignments according to weights
        //IMPORTANT: OFFSETS ARE NOT ALTERED IN THIS STEP 
        for (var i = 0; i < graderArray.length; i++) {
            assigned = Math.floor(graderArray[i].weight * distBasedWeights / total_weight);
            graderArray[i].incrementNumAssigned(assigned);
        }

        //sum of each grader's num_assigned AFTER distribution 
        now_distributed = graderArray.reduce((total, element) => {
            return total + element.num_assigned;
        }, 0);

        //TOTAL number of assignments that have been distributed
        let assigned_dist = now_distributed - already_distributed;

        //number of assignments that still need to be distributed due to rounding
        leftAssign = num_of_submissions - assigned_dist;

        //At this point in the program, all of the graders have an equal offset of 0.

        /*distribute remaining assignments evenly at first, if possible*/
        addedAssignments = Math.floor(leftAssign / graderArray.length);
        if (addedAssignments > 0) {
            for (var i = 0; i < graderArray.length; i++) {
                graderArray[i].incrementNumAssigned(addedAssignments);
            }
        }
        leftAssign -= (addedAssignments * graderArray.length);

        /*randomly distribute [leftAssign] remaining assignments AND update offsets*/
        //At this point in the program, all of the graders have an equal offset of 0.

        shuffle(graderArray);

        while (leftAssign !== 0) {
            for (let i = 0; i < graderArray.length; i++) {
                if (leftAssign === 0) break;
                if (graderArray[i].weight > 0) {
                    graderArray[i].incrementNumAssigned(1);
                    graderArray[i].decrementOffset(1);
                    leftAssign--;
                }
            }
        }


        //All of the assignments have been distributed at this point. 
        //All offsets are currently <= 0. 

        //Any grader's offset (with weight = 0) should not be increased by any automated means: 
        graderArray = normalize_offset(graderArray);

        for (let i = 0; i < graderArray.length; i++) {
            if (graderArray[i].weight < 1) {
                graderArray[i].updateOffset(0);
            }
        }

        return graderArray;

    } //end of else statement

    return normalize_offset(graderArray);
}



module.exports.shuffle = shuffle;
module.exports.formMatchingMatrix = formMatchingMatrix;
module.exports.main_distribute = main_distribute;
