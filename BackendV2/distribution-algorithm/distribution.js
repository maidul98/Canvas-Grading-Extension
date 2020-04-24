var AssignmentGrader = require('./grader-model');

/**
 * Shuffles the array a, in place
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
 * grader.offset = relative number of assignments that grader [grader] is behind on.
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
 * Randomly assigns each grader from [grader_array] exactly [dist_num_assigned] 
 * submissions from [submission_array] to grade. 
 * Returns a mapping from grader ID to submission ID. 
 * @param {Array} grader_array: 2D Array of graders containing the [dist_num_assigned]
 * value for each grader
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
 * Main function that distributes the submissions for one particular assignment, 
 * also taking into account of each graders' caps. 
 * @param {*} num_of_submissions: total number of submissions required to be distributed
 * @param {*} graderArray: 1D array containing AssignmentGrader objects, with appropriate 
 * num_assigned values. 
 */
function main_distribute(num_of_submissions, graderArray) {

    // console.log("num of subs" + num_of_submissions);
    // console.log(graderArray);
console.log("\n\nINITIAL PULLED FROM DB")
console.log(graderArray)

    //initial distribution 
    //only offset & num_assigned should be altered 
    graderArray = distribute(num_of_submissions, graderArray);

    // console.log("\n");
    // console.log(graderArray);


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

                grader.incrementNumAssigned(1);
                grader.decrementOffset(1);
                left_to_distribute--;
            }
        }

    }

    for (let i = 0; i < graderArray.length; i++)
        graderArray[i].update_dist_num_assigned(graderArray[i].num_assigned - graderArray[i].dist_num_assigned);

    return normalize_offset(graderArray);
}



/**
 * Fairly distributes [num_of_submissions] assignments among [graders] 
 * according to the graders' weights and offsets. 
 * @param {int} num_of_submissions: Total number of assignments that need to be distributed
 * @param {Array} graderArray: An array of AssignmentGrader objects for each grader,
 * where each grader's num_assigned value equals 0. 
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
        console.log("Distrubuted assigmnets according to offsets only")
        console.log(graderArray)
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
        console.log("\ndist by weights ")
        console.log(graderArray)
        //sum of each grader's num_assigned AFTER distribution 
        now_distributed = graderArray.reduce((total, element) => {
            return total + element.num_assigned;
        }, 0);

        //TOTAL number of assignments that have been distributed
        let assigned_dist = now_distributed - already_distributed;

        //number of assignments that still need to be distributed due to rounding
        leftAssign = num_of_submissions - assigned_dist;

        console.log("num that still need to be distributed: " + leftAssign)
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

        //Random distribution: 
        //An array is populated with numbers [0] to [graderArray.length-1] (represents graders).
        //The array is shuffled once.
        //The first [leftAssign] elements of the resulting array are chosen. 

        let randomArr = [];

        for (var p = 0; p < graderArray.length; p++)
            randomArr[p] = p;

        shuffle(randomArr);

        for (var q = 0; q < leftAssign; q++) {
            graderArray[randomArr[q]].incrementNumAssigned(1);
            graderArray[randomArr[q]].decrementOffset(1);
        }

        console.log("after everything is dist:")
        console.log(graderArray)

    } //end of else statement


    return normalize_offset(graderArray);
}



module.exports.shuffle = shuffle
module.exports.formMatchingMatrix = formMatchingMatrix
module.exports.main_distribute = main_distribute

//TESTING
//grader_id, weight, offset, num_assigned, dist_num_assigned, cap

//mango1
/*
arr = [
    new AssignmentGrader(1, 1, 0, 0, 0, 100),
    new AssignmentGrader(2, 2, 0, 0, 0, 100),
    new AssignmentGrader(3, 2, 0, 0, 0, 100),
    new AssignmentGrader(4, 3, 0, 0, 0, 100)];

console.log(arr);
console.log("\n\n");

arr = main_distribute(50, arr);
console.log(arr);
console.log("\n\n");

arr[0].update_cap(3);

arr = main_distribute(50, arr);
console.log(arr);
console.log("\n\n");

*/

//result = formMatchingMatrix(arr, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
//* /

/*
for (let i = 0; i < 5; i++) {
    arr[i].update_dist_num_assigned(arr[i].num_assigned);
    if (arr[i].grader_id === 4)
        arr[i].update_cap(4);
}

arr = main_distribute(6, arr);
console.log(arr);
console.log("\n\n");

for (let i = 0; i < 5; i++)
    arr[i].update_dist_num_assigned(arr[i].num_assigned);

arr = main_distribute(50, arr);
console.log(arr);
console.log("\n\n");

for (let i = 0; i < 5; i++) {
    arr[i].update_dist_num_assigned(arr[i].num_assigned);
    if (arr[i].grader_id === 2)
        arr[i].update_cap(10);
}

arr = main_distribute(70, arr);
console.log(arr);
console.log("\n\n");

* /
//total distributed = 220
*/