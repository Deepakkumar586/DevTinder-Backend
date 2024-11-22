const validator = require('validator');

const validateSignUpData = (req,res)=>{
    // validate user data here
    const {firstName, lastName, emailId, password} = req.body;

    if(!firstName || !lastName){
        throw new Error("Invalid first name or last name")
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Invalid email")
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    }
}
module.exports = {validateSignUpData}