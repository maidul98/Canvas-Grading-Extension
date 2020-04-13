var AssignmentGrader = require('./grader-model');

//IMPORTANT NOTES: 

//if a grader can't grade a few assignments, then we need to create set of "valid graders that can take on extra assignments" and UPDATE OFFSETS 
//and distribute these "currently ungrade-able assignments" FAIRLY according to grader's NORMALIZED offsets

//changes:  the first step should be ....all "valid" graders should only make it to array graderArray ***
//valid is determined by Graders who didn't opt out, who didn't take "leave of absence"
//if a grader took a "leave of absence", then we must update their offset (increase their offset accordingly - by an amount that a grader with the same weight got assigned - solely acc to their weight & NOT their offset )

//**lastly, we must consider the specific case where we are on the LAST assignment!! --> discuss with client about how that should be handled 

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
 * Randomly assigns each grader from [grader_array] exactly [num_assigned] 
 * submissions from [submission_array] to grade. 
 * Returns a mapping from grader ID to submission ID. 
 * @param {Array} grader_array: 2D Array of graders containing the [num_assigned]
 * value for each grader
 * @param {Array} submissions_array: 1D Array of submission ID's
 */
function formMatchingMatrix(grader_array, submissions_array) {
    const len = submissions_array.length;

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


//AssignmentGrader(grader_id, weight, offset, num_assigned, cap)

/**
 * Main function that distributes the submissions for one particular assignment, 
 * also taking into account of each graders' caps. 
 * @param {*} num_of_submissions: total number of submissions left to distribute currently 
 * @param {*} graderArray: 1D array containing AssignmentGrader objects, with appropriate 
 * prev_assigned values, and num_assigned = 0 for each grader. 
 */
function main_distribute(num_of_submissions, graderArray) {

    //initial distribution 
    //only offset & num_assigned should be altered 
    graderArray = distribute(num_of_submissions, graderArray);

    left_to_distribute = 0;

    //checking if the any grader's num_assigned value exceeds their cap 
    for (let i = 0; i < graderArray.length; i++) {

        surplus = graderArray[i].num_assigned - graderArray[i].cap;

        if (surplus >= 0) {
            graderArray[i].decrementNumAssigned(surplus);
            graderArray[i].incrementOffset(surplus);
            left_to_distribute += surplus;
        }
    }

    shuffle(graderArray);

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


    return graderArray;
}




/**
 * Fairly distributes [num_of_submissions] assignments among [graders] 
 * according to the graders' weights and offsets. 
 * @param {int} num_of_submissions: Total number of assignments that need to be distributed
 * @param {Array} graderArray: An array of AssignmentGrader objects for each grader,
 * where each grader's num_assigned value equals 0. 
 */
function distribute(num_of_submissions, graderArray) {

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

        //TOTAL number of assignments that have been distributed
        distAssign = graderArray.reduce((total, element) => {
            return total + element.num_assigned;
        }, 0);

        //number of assignments that still need to be distributed due to rounding
        leftAssign = num_of_submissions - distAssign;

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
        //The array is shuffled a random number of times.
        //The first [leftAssign] elements of the resulting array are chosen. 

        let randomArr = [];

        for (var p = 0; p < graderArray.length; p++)
            randomArr[p] = p;

        for (var c = 0; c < Math.floor((Math.random() * 4) + 3); c++)
            shuffle(randomArr);

        for (var q = 0; q < leftAssign; q++) {
            graderArray[randomArr[q]].incrementNumAssigned(1);
            graderArray[randomArr[q]].decrementOffset(1);
        }

    } //end of else statement

    //sort graders in order of worst to best offsets 
    graderArray.sort(function (a, b) {
        if (b.offset === a.offset) return 0;
        return b.offset > a.offset ? 1 : -1;
    });

    //normalize offsets so the professor can easily update offsets if s/he wishes
    //to before the next set of assignments are distributed 
    normalizing_cons = 0 - graderArray[graderArray.length - 1].offset;
    for (var i = 0; i < graderArray.length; i++)
        graderArray[i].incrementOffset(normalizing_cons);

    return graderArray;
}


module.exports.shuffle = shuffle
module.exports.formMatchingMatrix = formMatchingMatrix
module.exports.main_distribute = main_distribute






// //grader_id, weight, offset, cap 


let g1 = [1, 1, 0, 2];
let g2 = [2, 1, 0, 1];
let g3 = [3, 1, 0, 0];
let g5 = [3227, 1, -2, 100];
let g6 = [1228, 1, 3, 100];
let g7 = [1229, 1, 0, 100];
let g4 = [3226, 1, 1, 100];
let g8 = [1223, 1, 2, 100];
let g9 = [1224, 1, 0, 100];
let g10 = [3225, 2, 0, 100];
let g11 = [9, 2, 0, 2];
let g12 = [1227, 2, 0, 100];
let g13 = [1228, 2, 0, 100];
let g14 = [3229, 2, 0, 100];
let g15 = [3223, 2, 0, 100];
let g16 = [7, 3, 0, 4];
let g17 = [1228, 3, 0, 100];
let g18 = [1229, 3, 0, 100];
let g19 = [1223, 3, 0, 100];
let g20 = [3224, 3, -1, 100];
let ag1 = [1223, 1, 1, 100];
let ag2 = [8, 1, 2, 0];
let ag3 = [1225, 1, -2, 100];
let ag4 = [3226, 1, 0, 100];
let ag5 = [3227, 1, 0, 100];
let ag6 = [1228, 1, 3, 100];
let ag7 = [1229, 1, 0, 100];
let ag8 = [1223, 1, 0, 100];
let ag9 = [1224, 1, 0, 100];

let graders = [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13, g14, g15, g16, g17, g18, g19, g20,
    ag1, ag2, ag3, ag4, ag5, ag6, ag7, ag8, ag9];


//NEED TO DELETE AFTER TESTING
//intial set-up; will populate [num_assigned] cells later on 
let graderArray = [];
graders.forEach(element => {
    //grader_id, weight, offset, num_assigned, cap 
    graderArray.push(new AssignmentGrader(element[0], element[1], element[2], 0, element[3]));
});
//


//////////////////////////////////////



//grader_id, weight, offset, num_assigned, cap

arr = [
    new AssignmentGrader(1, 1, 45, 0, 10),
    new AssignmentGrader(2, 1, 65, 0, 100),
    new AssignmentGrader(3, 1, 11, 0, 100),
    new AssignmentGrader(4, 1, 51, 0, 100)
];

ans = main_distribute(100, arr);
console.log(ans);
