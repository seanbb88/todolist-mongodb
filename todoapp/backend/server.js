const mongoose = require("mongoose"); 
const express = require("express"); 
const bodyParser = require("body-parser"); 
const logger = require("morgan"); 
const Data = require("./data"); 

const API_PORT = 3001; 
const app = express(); 
const router = express.Router(); 

const dbRoute = "mongodb://seanbb88:databasepassword1.mlab.com:29831/todolist"; 

mongoose.connect(
    dbRoute, 
    { useNewUrlParser: true }
)

let db = mongoose.connection; 
//connection sucess messages
db.once("open", () => console.log("connected to the database")); 
db.on("error", console.error.bind(console, "MongoDB connection error:")); 

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 
app.use(logger("dev")); 

//get method
router.get("/getData", (req, res) => {
    Data.find((err, data) => {
        if (err) return res.json({ success: false, error: err}); 
        return res.json({ success: true, data: data}); 
    }); 
}); 

//update method
//this method will overwire existing data in our database
router.post("/updateData", (req, res) => {
    const { id, update } = req.body; 

    Data.findOneAndUpdate(id, update, err => {
        if (err) return res.json({ sucess: false, error: err }); 
        return res.json({ success: true })
    })
})

//delete method
//this method removes existing data in our database
router.delete("/deleteData", (req, res) => {
    const { id } = req.body; 

    Data.findOneAndDelete(id, err => {
        if(err) return res.send(err); 
        return res.json({ success: true }); 
    }); 
}); 

//create method
//this method adds new data into our database
router.post("/putData", (req, res) => {
    let data = new Data(); 

    const {id, message } = req.body; 

    if((!id && id !== 0 || !message)){
        return res.json({
            success: false, 
            error: "Invalid Inputs"
        }); 
    }
    data.message = message; 
    data.id = id; 
    data.save(err => {
        if (err) return res.json({ sucess: false, error: err })
        return res.json({ success: true}); 
    }); 
}); 

//append /api for our http requests
app.use("/api", router); 

//launch our backend into a port
app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`)); 