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

module.exports.updateLevelCompletion = async (userId, level, points) => {
    if (!userId || !level) {
        throw new Error('User ID and level are required');
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
        throw new Error('User not found');
    }

    // Update levelCompleted if this level is higher than current
    if (level > user.levelCompleted) {
        user.levelCompleted = level;
    }

    // Update points for the specific level
    if (points !== undefined && level >= 1 && level <= 5) {
        const levelKey = `level${level}`;
        if (points > user.points[levelKey]) {
            user.points[levelKey] = points;
        }
    }

    await user.save();
    return user;
}

module.exports.getLeaderboard = async () => {
    const users = await userModel.find().select('username fullname points levelCompleted');
    
    // Calculate total points for each user
    const leaderboard = users.map(user => {
        const totalPoints = Object.values(user.points).reduce((sum, points) => sum + points, 0);
        return {
            username: user.username,
            fullname: user.fullname,
            totalPoints,
            levelCompleted: user.levelCompleted,
            points: user.points
        };
    });
    
    // Sort by total points descending
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    
    return leaderboard;
}