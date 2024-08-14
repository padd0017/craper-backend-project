const passport = require('passport');
const { UnauthorizedError } = require('../utils/error');

const isAuthenticated = (req, res, next) =>
 passport.authenticate('bearer', {
    session: false,
    // failureRedirect: '/auth/login',
    failWithError: true,
  })(req, res, (e) => {
    if (e) {
      next(new UnauthorizedError('Unauthenticated'));
    }
    next();
  })

module.exports = isAuthenticated;
