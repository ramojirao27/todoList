const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// const date = require(__dirname+"/date.js");


const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended : true}))
app.use(express.static("public"));
const URI ='mongodb+srv://ramojirao:ramojirao9152@cluster0.h3s94xw.mongodb.net/todolistDB';
mongoose.connect(URI).then(() => console.log('Connected!'));

// var items = ["wakeup early", "do excercise"," eat healthy food"];
// var workItems =[];

const itemSchema = {
  name : String
};
const Item = mongoose.model('Item',itemSchema);

const item1 = new Item(
  {
    name : "Welcome to the todolist"
  }
);
const item2 = new Item(
  {
    name: "press + to add a new item"
  }
);
const item3 = new Item(
  {
    name : "<--- press it to delete an item"
  }
);
const defaultItems = [item1,item2,item3];
const listSchema ={
  name : String,
  item : [itemSchema]
}
const List = mongoose.model("List",listSchema);



app.get("/",function(req,res){
  function getDate() {
    var today = new Date();
    var options ={weekday : 'long',
        day : 'numeric',
        month : 'long'
    };
    var day = "";
    var day = today.toLocaleDateString("en-US", options);
  }

  Item.find().then(function(foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems) .then(() => console.log("successfully default item inserted into DB"));
      res.redirect("/");
    }
    else {
       res.render('list',{listTitle : "Today" , newlistItems : foundItems});
     };
  });

   });
   app.get("/:customListName",function(req,res){
        const customListName = _.capitalize(req.params.customListName);
         List.findOne({name:customListName}).then(function(foundList) {

             if(!foundList){
               const list = new List({
                   name : customListName,
                   item : defaultItems
                 })
               list.save();
               res.redirect("/"+customListName);
             }
             else{
               res.render("list",{listTitle : foundList.name , newlistItems : foundList.item});

             }
         });

      });

 app.post("/",function(req,res){
const itemName = req.body.newItem;
const listName = req.body.list;
const newItem = new Item({
  name : itemName
});
if (listName ==="Today") {
  newItem.save();
  res.redirect("/");
} else {
  List.findOne({name:listName}).then(function(foundList){
    foundList.item.push(newItem);
    foundList.save();
    res.redirect("/"+listName);
  });
}
});
app.post("/delete",function (req,res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName ==="Today") {
    Item.findByIdAndDelete(checkedItemId).then(()=> console.log("successfully deleted"));
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name :listName},{$pull:{item:{_id:checkedItemId}}}).then(()=>console.log("delete an item"));
    res.redirect("/"+listName);

  }


})



app.listen(3000,function () {
    console.log("the server is running on the port 3000");

})
