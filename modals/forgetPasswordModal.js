const mongoose = require('mongoose')

const Schema = mongoose.Schema

const forgetPasswordSchema = new Schema ({
    active : {
        type : String,
        required : true
    },
    expiresby : {
        type : Date,
        required : true
    },
    userId : {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
})

module.exports  = mongoose.model('Forgotpassword' , forgetPasswordSchema)
// const Sequelize = require('sequelize');
// const sequelize = require('../database/database');

// const Forgotpassword = sequelize.define('forgotpassword', {
//     id: {
//         type: Sequelize.UUID,
//         allowNull: false,
//         primaryKey: true,
//     },
//     active: Sequelize.BOOLEAN,
//     expiresby: Sequelize.DATE
// })

// module.exports = Forgotpassword;