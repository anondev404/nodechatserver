class UserNotFoundException {
    message;

    constructor(conflictUsername) {
        this.message = `${conflictUsername} not found`;
    }
}

module.exports.UserNotFoundException = UserNotFoundException;