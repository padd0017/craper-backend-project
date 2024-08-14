const { model, Schema } = require('mongoose');


const locationSchema = new Schema(
    {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: (coordinates) => coordinates.length === 2,
            message: (prop) => "there must be only 2 cordinates",
          },
        },
      },
      {
        _id: false,
      }
)

const suggestionSchema = new Schema(
    {
        address:{
            type: String,
            required: true,
            minLength: 3,
            maxLength: 255
        },
        date: {
            type: String,
            required: true
        },
        time:{
            type: String,
            required: true
        },
    },
    {
        _id: false,
    }
)

const crapSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 255
        },
        description: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 255
        },location: {
            type: locationSchema,
            required: true
        },
            images: {
            type: [String],
            required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['AVAILABLE', 'INTERESTED', 'SCHEDULED', 'AGREED', 'FLUSHED']
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    suggestion: {
        type: suggestionSchema,
    },
},
{
    timestamps: true,
    versionKey: false,
}
)

crapSchema.index({location:"2dsphere"})

module.exports = model('Crap', crapSchema)
