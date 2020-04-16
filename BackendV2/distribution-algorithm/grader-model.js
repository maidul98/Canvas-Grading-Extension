
function AssignmentGrader(grader_id, weight, offset, num_assigned, dist_num_assigned, cap) {
    //int
    this.grader_id = grader_id;

    //int >= 0
    this.weight = weight;

    //int
    this.offset = offset;

    //int >= 0 representing how many submissions have been already assigned for the specified assignment in all 
    this.num_assigned = num_assigned;

    //int >= 0 representing how many submissions have been assigned to the grader in this round of distribution 
    //not stored in database 
    this.dist_num_assigned = dist_num_assigned;

    //int >= 0  
    this.cap = cap;
}


/** Overwrites the grader's weight to [weight] */
AssignmentGrader.prototype.updateWeight = function (weight) {
    if (Number.isInteger(weight)) {
        throw new TypeError('weight should be an integer');
    }
    this.weight = weight;
};

/** Overwrites the grader's offset to [offset] */
AssignmentGrader.prototype.updateOffset = function (offset) {
    if (!Number.isInteger(offset)) {
        throw new TypeError('offset should be an integer');
    }

    this.offset = offset;
};

AssignmentGrader.prototype.update_cap = function (cap) {
    this.cap = cap;
}

/** Overwrites the grader's dist_num_assigned to [dist_num_assigned] */
AssignmentGrader.prototype.update_dist_num_assigned = function (dist_num_assigned) {
    this.dist_num_assigned = dist_num_assigned;
};

/** Overwrites the grader's num_assigned to [num_assigned] */
AssignmentGrader.prototype.update_num_assigned = function (num_assigned) {
    this.num_assigned = num_assigned;
};

/** Decrements the grader's weight by [weight] */
AssignmentGrader.prototype.decrementWeight = function (weight) {
    if (Number.isInteger(weight)) {
        throw new TypeError('weight should be an integer');
    }
    this.weight -= weight;
};

/** Increments the grader's weight by [weight] */
AssignmentGrader.prototype.incrementWeight = function (weight) {
    if (Number.isInteger(weight)) {
        throw new TypeError('weight should be an integer');
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