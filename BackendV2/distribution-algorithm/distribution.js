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



/**
 * Fairly distributes [num_of_submissions] assignments among [graders] 
 * according to the graders' weights and offsets. 
 * @param {int} num_of_submissions: Total number of assignments that need to be distributed
 * @param {Array} graders: A 2D-array containing [graders id, weight, offset]
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

        //distributes assignments according to offsets (according to tiers) AND update offsets 

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
            graderArray[i].updateNumAssigned(graderArray[i].offset);
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
module.exports.distribute = distribute
module.exports.formMatchingMatrix = formMatchingMatrix