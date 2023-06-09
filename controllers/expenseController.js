const Expense = require("../modals/expenseModal");
const User = require("../modals/userModal");
const DownloadUrl = require("../modals/fileURL")
const UserServices = require('../services/userServices')
const S3Services = require('../services/s3Services')
const dotenv = require("dotenv");

dotenv.config()

exports.saveToStorage = async (req, res, next) => {
  const amount = req.body.amountAdd;
  const description = req.body.descriptionAdd;
  const category = req.body.categoryAdd;

  if (!amount || !description || !category) {
    return res
      .status(400)
      .json({ error: "Amount, description, and category fields are required" });
  }

  try {
    const data = new Expense ({
        expenseAmount: amount,
        description: description,
        category: category,
        userId: req.user.id,
      });
    
    const savedExpense =  await data.save()
    const totalExpense =
      Number(req.user.totalExpenses) + Number(savedExpense.expenseAmount);

    await User.findByIdAndUpdate(req.user.id, { totalExpenses: totalExpense });


    res.status(201).json({ newExpense: data, totalExpense: totalExpense });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getAllUsers = async (req, res, next) => {
  const page = req.params.id
  const Items_Per_Page = parseInt(req.query.limit || 2);
  try {
    let count = await Expense.countDocuments({ userId: req.user.id})

    const expenses = await Expense.find({ userId: req.user.id })
      .skip((page-1)*Items_Per_Page)
      .limit (Items_Per_Page)

    res.status(200).json({
      expenses,
      info: {
          currentPage: page,
          hasNextPage: count > page * Items_Per_Page,
          hasPreviousPage: page > 1,
          nextPage: +page + 1,
          previuosPage: +page - 1,
          lastPage: Math.ceil(count / Items_Per_Page) 
      }
  });
    // Expense.findAll({ where: { userId: req.user.id } }).then((expense) => {
    // res.status(201).json({ expense });
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.deleteExpense = async (req, res, next) => {

  if (!req.params.id) {
    res.status(400).json({ err: "Missing ExpenseID" });
  }
  try {
    const expenseId = req.params.id;
    const expense = await Expense.findOneAndDelete(
      { _id: expenseId, userId: req.user.id }
    );
    const totalExpense =
      Number(req.user.totalExpenses) - Number(expense.expenseAmount);

    await User.findByIdAndUpdate(req.user.id, { totalExpenses: totalExpense });


    res.status(201).json({ success: true, totalExpense: totalExpense });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.downloadExpense = async (req, res, next) => {
  try {
    // const expenses = await req.user.getExpenses()
    const expenses = await Expense.find({ userId: req.user._id });

    console.log("expense of user is >>>>" , expenses)

    // const expenses = await UserServices.getExpenses(req)
    const userID = req.user.id;
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense/${userID}/${new Date()}.txt`;
    const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
    const downloadUrlData = new DownloadUrl(
        {
          fileURL: fileURL,
          filename,
          userId: req.user._id,
        });
    await downloadUrlData.save()
    res.status(200).json({ fileURL,downloadUrlData,success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({fileURL: '', success: false });
  }
};
exports.downloadAllUrl = async(req,res,next) =>{
    try{
        const allURL = await DownloadUrl.find( {userId : req.user._id } )
        res.status(200).json({allURL})

    }catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong", success: false });

    }

}

