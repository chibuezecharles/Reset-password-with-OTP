const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema(
{
    username:{
        type: String,
        unique: true,
        required: [true, 'Please enter your username']
    },

    email: {
        type: String,
        unique: true,
        trim: true,
        required: [true, 'Please enter your a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },

    password:{
        type: String,
        required: [true, 'Please enter a valid password'],
        trim: true,
    },

    phoneNo: {
        type: Number,
        required: [true, 'Please enter your phone number '],
        trim: true,
        unique: true,
    }

},
{
    timestamps:true,
}
);


const Users = mongoose.model('users', usersSchema);

module.exports = Users;