const userModel = require('../models/user.model');

module.exports.createUser = async ({firstname, lastname, username, birthdate, password})=>{
    if(!firstname || !username || !birthdate || !password){
        throw new Error('All fields are required');
    }

    const user = userModel.create({
        fullname:{
            firstname,
            lastname
        },
        username,
        birthdate,
        password
    });

    return user;
}