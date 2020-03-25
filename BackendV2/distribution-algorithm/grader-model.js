/**
 * Need:
 * Number of submissions: Pulled from DB
 * List of graders: Pulled from DB and filtered accordingly 
 * Weights: Intially inputted by professor
 * Offsets: Pulled from DB 
 */

function AssignmentGrader(grader_id, weight, offset, num_assigned) {
    this.grader_id = grader_id;
    this.weight = weight; //int
    this.offset = offset; //int
    this.num_assigned = num_assigned; //int 
}

/** Overwrites the grader's weight to [weight] */
AssignmentGrader.prototype.updateWeight = function (weight) {
    if (Number.isInteger(wieght)) {
        throw new TypeError('wieght should be an integer');
    }
    this.weight = weight;
};

/** Overwrites the grader's offset to [weight] */
AssignmentGrader.prototype.updateOffset = function (offset) {
    if (!Number.isInteger(offset)) {
        throw new TypeError('offset should be an integer');
    }

    this.offset = offset;
};

/** Overwrites the number of assignments that the grader has been assigned to [num_assigned] */
AssignmentGrader.prototype.updateNumAssigned = function (num_assigned) {
    if (!Number.isInteger(num_assigned)) {
        throw new TypeError('num_assigned should be an integer');
    }

    this.num_assigned = num_assigned;
};

/** Decrements the grader's weight by [weight] */
AssignmentGrader.prototype.decrementWeight = function (weight) {
    if (Number.isInteger(wieght)) {
        throw new TypeError('wieght should be an integer');
    }
    this.weight -= weight;
};

/** Increments the grader's weight by [weight] */
AssignmentGrader.prototype.incrementWeight = function (weight) {
    if (Number.isInteger(wieght)) {
        throw new TypeError('wieght should be an integer');
    }
    this.weight += weight;
};

/** Decrements the grader's offset by [offset] */
AssignmentGrader.prototype.decrementOffset = function (offset) {
    if (!Number.isInteger(offset)) {
        throw new TypeError('offset should be an integer');
    }

    this.offset -= offset;
};

/** Increments the grader's offset by [offset] */
AssignmentGrader.prototype.incrementOffset = function (offset) {
    if (!Number.isInteger(offset)) {
        throw new TypeError('offset should be an integer');
    }

    this.offset += offset;
};

/** Decrements the grader's num_assigned by [num_assigned] */
AssignmentGrader.prototype.decrementNumAssigned = function (num_assigned) {
    if (!Number.isInteger(num_assigned)) {
        throw new TypeError('num_assigned should be an integer');
    }

    this.num_assigned -= num_assigned;
};

/** Increments the grader's num_assigned by [num_assigned] */
AssignmentGrader.prototype.incrementNumAssigned = function (num_assigned) {
    if (!Number.isInteger(num_assigned)) {
        throw new TypeError('num_assigned should be an integer');
    }

    this.num_assigned += num_assigned;
};


module.exports = AssignmentGrader;