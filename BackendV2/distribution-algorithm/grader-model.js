/**
 * Need:
 * Number of submissions: Pulled from DB
 * list of graders: Pulled from DB
 * Weights: intially inputted by professor
 * Offsets: Pulled from DB 
 */

function AssignmentGrader(grader_id, weight, offset, num_assigned) {
    this.grader_id = grader_id;
    this.weight = weight; //int
    this.offset = offset; //int
    this.num_assigned = num_assigned; //int 
}

AssignmentGrader.prototype.updateWeight = function (weight) {
    if (Number.isInteger(wieght)) {
        throw new TypeError('wieght should be an integer');
    }
    this.weight = weight;
};

AssignmentGrader.prototype.updateOffset = function (offset) {
    if (!Number.isInteger(offset)) {
        throw new TypeError('offset should be an integer');
    }

    this.offset = offset;
};

AssignmentGrader.prototype.updateNumAssigned = function (num_assigned) {
    if (!Number.isInteger(num_assigned)) {
        throw new TypeError('num_assigned should be an integer');
    }

    this.num_assigned = num_assigned;
};


AssignmentGrader.prototype.decrementWeight = function (weight) {
    if (Number.isInteger(wieght)) {
        throw new TypeError('wieght should be an integer');
    }
    this.weight -= weight;
};

AssignmentGrader.prototype.incrementWeight = function (weight) {
    if (Number.isInteger(wieght)) {
        throw new TypeError('wieght should be an integer');
    }
    this.weight += weight;
};




AssignmentGrader.prototype.decrementOffset = function (offset) {
    if (!Number.isInteger(offset)) {
        throw new TypeError('offset should be an integer');
    }

    this.offset -= offset;
};

AssignmentGrader.prototype.incrementOffset = function (offset) {
    if (!Number.isInteger(offset)) {
        throw new TypeError('offset should be an integer');
    }

    this.offset += offset;
};




AssignmentGrader.prototype.decrementNumAssigned = function (num_assigned) {
    if (!Number.isInteger(num_assigned)) {
        throw new TypeError('num_assigned should be an integer');
    }

    this.num_assigned -= num_assigned;
};

AssignmentGrader.prototype.incrementNumAssigned = function (num_assigned) {
    if (!Number.isInteger(num_assigned)) {
        throw new TypeError('num_assigned should be an integer');
    }

    this.num_assigned += num_assigned;
};



module.exports = AssignmentGrader;