
function DistResult(graderArray, submissionsArray, assignmentsLeftToDist) {
  //1D Object array of AssignmentGrader's
  this.graderArray = graderArray;

  //1D int array of submission ID's
  this.submissionsArray = submissionsArray;

  //boolean 
  //true if num_submissions > 0
  //false otherwise 
  this.assignmentsLeftToDist = assignmentsLeftToDist;
}


module.exports = DistResult;