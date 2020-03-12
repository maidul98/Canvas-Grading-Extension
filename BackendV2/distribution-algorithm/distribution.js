var AssignmentGrader = require('./grader-model');

//int num_of_submissions = (num of groups that actually submitted)

//graders = 2D Array of [graders ids, weights]
//graders[r][0] = grader id of grader in row r 
//graders[r][1] = weight of grader in row r
//graders[r][2] = offset of grader in row r 


function distribute(num_of_submissions, graders) {

  //gets total weight
  total_weight = graders.reduce(function (total, element) {
    return total + element[1];
  }, 0);
  console.log('Total weight: ' + total_weight)

  //shuffle grader 2D-array 
  shuffle(graders);


  //computes num_weighted_assigned for each grader and fills in array of graders
  //takes into account only weights, and rounds down 
  let graderArray = []
  graders.forEach(element => {
    assigned = Math.floor(element[1] * num_of_submissions / total_weight);
    console.log(`Number assigned to id ${element[0]}: ${assigned}`)
    //grader_id, weight, offset, num_assigned
    graderArray.push(AssignmentGrader(element[0], element[1], element[2], assigned));
  });


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



  //distributes the remaining [num_of_submissions-currDist] assignments across
  //graders till their offsets equal 0 & update grader's offsets 
  //*if none have offset = 0, distribute evenly 






}




//TEST CASES 
let testArr = [[1, 3], [2, 4], [4, 5], [4, 5]];
distribute(0, 0, testArr);

//Create dummy graders
let g1 = [1223, 0.5, 0]
let g2 = [1224, 0.2, -1]
let g3 = [1225, 0.3, 2]
let g4 = [1226, 0.3, -1]
let g5 = [1227, 0.3, -1]

let graders = [g1, g2, g3, g4, g5]
distribute(50, graders)