var express=require("express");
var bodyParser = require("body-parser");
var _=require("underscore");
var app=express();
var port=process.env.PORT || 3000;


var todos=[];

app.get("/",function(req,res){
  res.send("Todo API Root");
});

app.get("/todos",function(req,res){
  res.json(todos);
});

app.get("/todos/:id",function(req,res){
  var todoID=parseInt(req.params.id,10);
  var matchedTodo=_.findWhere(todos,{id:todoID});
  if(matchedTodo){
    res.json(matchedTodo);
  }
  else{
    res.status(404).send();
  }
});

//New ToDo posting functionality setup
var nextID=todos.length+1;
app.use(bodyParser.json());

//POST new ToDo
app.post("/todos",function(req,res){
  var body=_.pick(req.body,"description","completed");

  //validate input
  if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length===0){
    return res.status(400).send();
  }

  //remove unnecessary whitespace
  body.description=body.description.trim();
  //add ID field
  body.id=nextID++;
  //push to ToDos
  todos.push(body);
  res.json(body);
})

app.listen(port,function(){
  console.log("Express listening on port "+port+"!");
})
