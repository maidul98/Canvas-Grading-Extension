var AssignmentGrader = require('./grader-model');

//DATA WE WILL GET:
//int num_of_submissions = (num of groups that actually submitted)

//graders = 2D Array of [graders ids, weights]
//graders[r][0] = grader id of grader in row r 
//graders[r][1] = weight of grader in row r
//graders[r][2] = offset of grader in row r


//NOTES AFTER CLIENT MEETING 
//offset first and then dist
//normalize offsets 
//make sure the offsets dont "break" the implementation e.g. the grader thats "most ahead of schedule" should be assigned a fair non-zero number of assigbnments still 
//rounding *

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
        graderArray[counter].updateNumAssigned(graderArray[counter].num_assigned + (-1 * graderArray[counter].offset));
        graderArray[counter].updateOffset(0);
        remainingAssignments += graderArray[counter].offset;
      } else {
        graderArray[counter].updateNumAssigned(graderArray[counter].num_assigned + remainingAssignments);
        graderArray[counter].updateOffset(graderArray[counter].offset + remainingAssignments);
        remainingAssignments = 0;
        break
      }
    }

    if (graderArray[counter].offset > 0 || graderArray[counter].offset == graderArray.length - 1) counter = 0;
    else counter++;
  }






}




//TEST CASES 
// let testArr = [[1, 3], [2, 4], [4, 5], [4, 5]];
// distribute(0, 0, testArr);

//Create dummy graders
let g1 = [1223, 2, 0]
let g2 = [1224, 2, -1]
let g3 = [1225, 3, 3]
let g4 = [1226, 3, -1]
let g5 = [1227, 3, -1]

let graders = [g1, g2, g3, g4, g5]
distribute(50, graders)