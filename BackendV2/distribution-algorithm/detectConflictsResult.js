
function DetectConflictOutput(graderArray, submissionsArray) {
  //1D Object array of AssignmentGrader's
  this.graderArray = graderArray;

  //1D int array of submission ID's
  this.submissionsArray = submissionsArray;
}

module.exports = DetectConflictOutput;