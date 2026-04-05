

const { validateUpdateprofile } = require('../utils/validation');

exports.Profile = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            message: "Profile fetched successfully",
            data: user
        })

    }
    catch (err) {
        return res.status(500).json({
            message: "Error occurred while fetching profile",
            error: err.message
        })
    }
}

exports.UpdateProfile = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        validateUpdateprofile(req.body);

        const user = req.user;

        Object.keys(req.body).forEach((key) => {
            user[key] = req.body[key];
        });

        await user.save();
        res.status(200).json({
            message: ` ${user.firstName}, Profile updated successfully`,
            data: user
        })
    }
    catch (err) {
        return res.status(500).json({
            message: "Error occurred while updating profile",
            error: err.message
        })
    }
}