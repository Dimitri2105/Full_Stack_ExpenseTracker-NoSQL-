const User = require('../modals/userModal')

exports.getUserLeaderboard = async(req,res,next) => {
    try{
        const listOfleaderBoardInfo = await User.find().sort( [["totalExpenses" , -1 ]] )
        res.status(200).json(listOfleaderBoardInfo)

    }catch (error) {
        console.log(error)
        res.status(500).json({ error: error });
      }

}



