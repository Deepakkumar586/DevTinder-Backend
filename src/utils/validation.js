
const validator = require('validator');


const validateSignupData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName || !emailId || !password) {
        throw new Error("Missing required fields: firstName, lastName, emailId, password");
    }
    else if (validator.isEmail(emailId) === false) {
        throw new Error("Invalid email address");
    }
    else if (validator.isStrongPassword(password) === false) {
        throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one symbol.");
    }
}


const validateLoginData = (req) => {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
        throw new Error("Missing required fields: emailId, password");
    }
    else if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email address");
    }


}


const validateUpdateprofile = (req) => {
    const allowedData = ['age','gender','about','location','photoUrl','skills'];

    const keys = Object.keys(req).every((key)=>
        allowedData.includes(key)
    );

    if(!keys){
        throw new Error("Invalid fields in update profile data");
    }

    
}
module.exports = { validateSignupData, validateLoginData,validateUpdateprofile };