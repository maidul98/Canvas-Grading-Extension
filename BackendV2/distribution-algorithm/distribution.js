var AssignmentGrader = require('./grader-model');

//IMPORTANT NOTES: 

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
export function shuffle(a) {
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
export function distribute(num_of_submissions, graders) {

  if (num_of_submissions <= 0) {
    console.log("There are currently no assignments to distribute.");
    return [];
  }

  //intial set-up; will populate [num_assigned] cells later on 
  let graderArray = [];
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
  //grader.offset = relative number of assignments that grader [grader] is behind on.
  normalizing_constant = 0 - graderArray[graderArray.length - 1].offset;
  for (var i = 0; i < graderArray.length; i++)
    graderArray[i].incrementOffset(normalizing_constant);


  console.log(graderArray); //PRINT STATEMENT FOR TESTING 
  console.log(' ');




  //computes sum of all graders' offsets
  totalOffset = graderArray.reduce((total, element) => {
    return total + element.offset;
  }, 0);


  if (num_of_submissions < totalOffset) {
    /* In this case, since the sum of the offsets exceeds the total number of 
    assignments that need to be distributed, there will be no assignments left
    to be distributed based on the graders' weights. */


    console.log("Assignmented will be distributed solely by offsets. ") //PRINTING STATEMENT USED FOR TESTING 
    console.log(" "); //PRINTING STATEMENT USED FOR TESTING

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


    console.log('Assignmented will be distributed by weigths AND offsets. '); //PRINTING STATEMENT USED FOR TESTING 
    console.log(' '); //PRINTING STATEMENT USED FOR TESTING


    //first, distribute [totalOffset] assignments according to offsets AND update offsets 
    for (var i = 0; i < graderArray.length; i++) {
      graderArray[i].updateNumAssigned(graderArray[i].offset);
      graderArray[i].updateOffset(0);
    }

    console.log('Assignments distributed by offsets first:');
    console.log(graderArray); //PRINTING STATEMENT USED FOR TESTING
    console.log(' '); //PRINTING STATEMENT USED FOR TESTING


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


    console.log('Assignments distributed by weights now:');
    console.log(graderArray); //PRINTING STATEMENT USED FOR TESTING
    console.log(' '); //PRINTING STATEMENT USED FOR TESTING


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


    console.log('Assignments completely distributed by rounding errors now:');
    console.log(graderArray); //PRINTING STATEMENT USED FOR TESTING
    console.log(' '); //PRINTING STATEMENT USED FOR TESTING


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


  console.log("FINAL OUTPUT: ") //PRINTING STATEMENT USED FOR TESTING 
  console.log(graderArray); //PRINTING STATEMENT USED FOR TESTING 
  return graderArray;

}



//Create dummy graders
let g1 = [1223, 1, 0];
let g2 = [1224, 1, 0];
let g3 = [1225, 1, 0];
let g4 = [3226, 1, 1];
let g5 = [3227, 1, 1];
let g6 = [1228, 1, 0];
let g7 = [1229, 1, 0];
let g8 = [1223, 1, 0];
let g9 = [1224, 1, 0];
let g10 = [3225, 2, 2];
let g11 = [3226, 2, 1];
let g12 = [1227, 2, 0];
let g13 = [1228, 2, 0];
let g14 = [3229, 2, 1];
let g15 = [3223, 2, 1];
let g16 = [3245, 3, 2];
let g17 = [1228, 3, 0];
let g18 = [1229, 3, 0];
let g19 = [1223, 3, 0];
let g20 = [3224, 3, 2];
let ag1 = [1223, 1, 0];
let ag2 = [1224, 1, 0];
let ag3 = [1225, 1, 0];
let ag4 = [3226, 1, 1];
let ag5 = [3227, 1, 1];
let ag6 = [1228, 1, 0];
let ag7 = [1229, 1, 0];
let ag8 = [1223, 1, 0];
let ag9 = [1224, 1, 0];
let ag10 = [3225, 2, 2];
let ag11 = [3226, 2, 1];
let ag12 = [1227, 2, 0];
let ag13 = [1228, 2, 0];
let ag14 = [3229, 2, 1];
let ag15 = [3223, 2, 1];
let ag16 = [3245, 3, 2];
let ag17 = [1228, 3, 0];
let ag18 = [1229, 3, 0];
let ag19 = [1223, 3, 0];
let ag20 = [4444, 3, 4];

let graders = [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13, g14, g15, g16, g17, g18, g19, g20,
  ag1, ag2, ag3, ag4, ag5, ag6, ag7, ag8, ag9, ag10, ag11, ag12, ag13, ag14, ag15, ag16, ag17, ag18, ag19, ag20];

distribute(567, graders);