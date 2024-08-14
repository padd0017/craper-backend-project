const { model, Schema } = require('mongoose');

const userSchema = new Schema(
    {
        name: {
          type: String,
          required: true,
        },
        googleId: {
          unique: true,
          type: String,
          required: true,
        },
      },
      {
        timestamps: true,
        versionKey: false,
      }
)

module.exports = model('User', userSchema);