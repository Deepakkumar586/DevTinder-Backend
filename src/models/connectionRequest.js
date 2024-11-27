const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    // sender
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      //   ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      //   ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{value} is incorrect status type`,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// connectionRequestHandler -- > compound index
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  // Self-request Validation
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself !");
  }
  next();
});

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
