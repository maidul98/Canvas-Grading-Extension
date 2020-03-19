var AssignmentGrader = require('./grader-model');

//DATA WE WILL GET:
//int num_of_submissions = (num of groups that actually submitted)

//graders = 2D Array of [graders ids, weights]
//graders[r][0] = grader id of grader in row r 
//graders[r][1] = weight of grader in row r
//graders[r][2] = offset of grader in row r


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

    //number of assignments to distributed according to weights
    distBasedWeights = num_of_submissions - totalOffset;

    //gets total weight
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
    //An array is populated with numbers [0] to [graderArray.length-1].
    //The array is shuffled a random number of times.
    //The first [leftAssign] elements of the resulting array are chosen. 





  }


  console.log(" ")
  console.log(graderArray);












  /*
    //////////////////////////////////////////////////////////////
  
    //gets total weight
    total_weight = graders.reduce((total, element) => {
      return total + element[1];
    }, 0);
    console.log('Total weight: ' + total_weight)
  
  
  
    //computes num_weighted_assigned for each grader and fills in array of graders
    //takes into account only weights, and rounds down 
    let graderArray = []
    graders.forEach(element => {
      assigned = Math.floor(element[1] * num_of_submissions / total_weight);
      console.log(`Number assigned to id ${element[0]}: ${assigned}`)
      //grader_id, weight, offset, num_assigned
      graderArray.push(new AssignmentGrader(element[0], element[1], element[2], assigned));
    });
  
    console.log(graderArray);
  
  
    //shuffleS graderArray for random distribution of assignments 
    shuffle(graderArray);
  
  
    //currDist = total number of [num_of_submissions] assignments that have actually
    //been distributed to graders as of now
    currDist = graderArray.reduce(function (total, element) {
      return total + element.num_assigned;
    }, 0);
    console.log('CurrentDist: ' + currDist)
  
    //calculates difference between (num_of_submissions) and (currDist)
    remainingAssignments = num_of_submissions - currDist;
    console.log('remaining assignments: ' + remainingAssignments)
  
    //sort graders in order of worst to best offsets 
    graderArray.sort(function (a, b) {
      if (b.offset === a.offset) return 0;
      return b.offset > a.offset ? -1 : 1;
    });
  
    console.log(graderArray);
  
  
    //distributes the remaining [num_of_submissions-currDist] assignments across
    //graders till their offsets equal 0 & update grader's offsets 
    //*if none have offset = 0, distribute evenly 
  
    var counter = 0;
  
    while (remainingAssignments > 0 && counter < graderArray.length) {
      if (graderArray[counter].offset < 0) {
        if (remainingAssignments + graderArray[counter].offset >= 0) {
          console.log(graderArray[counter].num_assigned + (-1 * graderArray[counter].offset) + '');
          graderArray[counter].updateNumAssigned(graderArray[counter].num_assigned + (-1 * graderArray[counter].offset));
          graderArray[counter].updateOffset(0);
          remainingAssignments += graderArray[counter].offset;
        } else {
          console.log(graderArray[counter].num_assigned + remainingAssignments + '');
          graderArray[counter].updateNumAssigned(graderArray[counter].num_assigned + remainingAssignments);
          graderArray[counter].updateOffset(graderArray[counter].offset + remainingAssignments);
          remainingAssignments = 0;
          break
        }
      }
  
      if (graderArray[counter].offset > 0 || graderArray[counter].offset == graderArray.length - 1) counter = 0;
      else counter++; 
    }
  
    */
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

let graders = [g1, g2, g3, g4, g5, g6, g7]
distribute(124, graders)