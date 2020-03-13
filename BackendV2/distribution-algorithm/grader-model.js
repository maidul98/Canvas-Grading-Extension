/**
 * Need:
 * Number of submissions: Pulled from DB
 * list of graders: Pulled from DB
 * Weights: input by professor
 */

function AssignmentGrader(grader_id, weight, offset, num_assigned) {
  this.grader_id = grader_id;
  this.weight = weight;
  this.offset = offset;
  this.num_assigned = num_assigned; //int 
}

AssignmentGrader.prototype.updateWeight = function (weight) {
  if (Number.isNaN(num_assigned)) {
    throw new TypeError('num_assigned should be an integer')
  }
  this.weight = weight;
}

AssignmentGrader.prototype.updateOffset = function (offset) {
  if (!Number.isInteger(offset)) {
    throw new TypeError('offset should be an integer')
  }

  this.offset = offset;
}

AssignmentGrader.prototype.updateNumAssigned = function (num_assigned) {
  if (!Number.isInteger(num_assigned)) {
    throw new TypeError('num_assigned should be an integer')
  }

  this.num_assigned = num_assigned
}

module.exports = AssignmentGrader