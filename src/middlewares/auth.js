const adminAuth = (req, res, next) => {
    console.log("admin auth is getting check");
    const token = "xyz";
    const isAuthorized = token === "xyz";
    if (!isAuthorized) {
      res.status(401).send("Unauthorized Access request");
    } else {
      next();
    }
  }

const userAuth = (req, res, next) => {
    console.log("user auth is getting check");
    const token = "xyzs";
    const isAuthorized = token === "xyz";
    if (!isAuthorized) {
      res.status(401).send("Unauthorized Access request");
    } else {
      next();
    }
  }
  module.exports = {adminAuth,userAuth}