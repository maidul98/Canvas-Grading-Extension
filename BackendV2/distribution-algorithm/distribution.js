var AssignmentGrader = require('./grader-model');

//***PRE-CONDITION: ALL GRADER ID'S MUST BE > 0. 


//IMPORTANT NOTES: 

//******SOME CHANGES THAT NEED TO BE MADE: 
//Currenly, I update offsets/num_assigned using "=" rather than the methods - which i shall change tom :) 
//we have setter methods for AssignmentGrader.....should i also add getter methods?! i feel like i should 
//I need to test all possible edge cases...but everything seems to be working really well as of now!! YAY :D 

//currently, all of the vital (output) info lies in the [num_assigned] cell of graderArray
//actual assignments need to be dsitributed randomly to each grader according to their [num_assigned] in graderArray ....i can do this only
//after i have more info about how the assignments are represented ... through URL's or what???

//also....where does code "lie" for 
//if a grader can't grade a few assignments, then we need to create set of "valid graders that can take on extra assignments" and UPDATE OFFSETS 
//and distribute these "currently ungrade-able assignments" FAIRLY according to grader's NORMALIZED offsets
//if all offsets are 0, then randomly distribute "currently ungrade-able assignments"

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
 * Fairly distributes [num_of_submissions] assignments among [graders] 
 * according to the graders' weights and offsets. 
 * @param {int} num_of_submissions: Total number of assignments that need to be distributed
 * @param {Array} graders: A 2D-array containing [graders id, weight, offset]
 */
function distribute(num_of_submissions, graders) {

  //intial set-up; populate [num_assigned] cells later on 
  let graderArray = []
  graders.forEach(element => {
    //grader_id, weight, offset, num_assigned
    graderArray.push(new AssignmentGrader(element[0], element[1], element[2], 0));
  });


  //sort graders in order of worst to best offsets 
  //greater offset = worse offset
  //smaller offset = better offset 
  graderArray.sort(function (a, b) {
    if (b.offset === a.offset) return 0;
    return b.offset > a.offset ? 1 : -1;
  });


  //normalize offsets such that the least offset equals 0; and
  //grader.offset = number of assignments that grader [grader] is behind on.
  normalizing_constant = 0 - graderArray[graderArray.length - 1].offset;
  for (var i = 0; i < graderArray.length; i++)
    graderArray[i].offset += normalizing_constant;


  console.log(graderArray); //PRINT STATEMENT FOR TESTING 
  console.log(" ");

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
        tier[i][j] = graderArray[j].grader_id;
      }
    }

    //distributes assignments according to offsets (according to tiers) AND update offsets 
    for (var i = tier.length - 1; i >= 0; i--) {
      var counter = 0;
      while (tier[i][counter] > 0) {
        if (num_of_submissions == 0) break;
        graderArray[counter].num_assigned += 1;
        graderArray[counter].offset -= 1;
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
      graderArray[i].num_assigned = graderArray[i].offset;
      graderArray[i].offset = 0;
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
      graderArray[i].num_assigned += assigned;
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
        graderArray[i] += addedAssignments;
      }
    }
    leftAssign -= addedAssignments * graderArray.length;

    /*randomly distribute [leftAssign] remaining assignments AND update offsets*/

    //Random distribution: 
    //An array is populated with numbers [0] to [graderArray.length-1] (represents graders).
    //The array is shuffled a random number of times.
    //The first [leftAssign] elements of the resulting array are chosen. 

    console.log(graderArray); //PRINTING STATEMENT USED FOR TESTING 

    let randomArr = [graderArray.length];

    for (var p = 0; p < graderArray.length; p++)
      randomArr[p] = p;

    for (var c = 0; c < Math.floor((Math.random() * 7) + 3); c++)
      shuffle(randomArr);

    for (var q = 0; q < leftAssign; q++) {
      graderArray[randomArr[q]].num_assigned += 1;
      graderArray[randomArr[q]].offset -= 1;
    }

    console.log(randomArr); //PRINTING STATEMENT USED FOR TESTING 

  }


  console.log(" ") //PRINTING STATEMENT USED FOR TESTING 
  console.log(graderArray); //PRINTING STATEMENT USED FOR TESTING 


}




//TEST CASES 
// let testArr = [[1, 3], [2, 4], [4, 5], [4, 5]];
// distribute(0, 0, testArr);

//Create dummy graders
let g1 = [1223, 2, 0]
let g2 = [1224, 2, -2]
let g3 = [1225, 3, 3]
let g4 = [1226, 3, -1]
let g5 = [1227, 3, -1]
let g6 = [1228, 4, -7]
let g7 = [1229, 5, 4]

let g10 = [1223, 2, 0]
let g20 = [1224, 2, 2]

let graders = [g1, g2, g3, g4, g5, g6, g7]

//let graders = [g10, g20]

distribute(124, graders)