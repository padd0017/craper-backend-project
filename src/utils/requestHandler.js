const requestHandler = (fn) => async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (err) {
      console.log("!", err);
      next(err);
    }
  };
  
  module.exports = requestHandler;
  