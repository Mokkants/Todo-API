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
});

//Removing a ToDo
app.delete("/todos/:id",function(req,res){
var todoID=parseInt(req.params.id,10);
var matchedTodo=_.findWhere(todos,{id:todoID});

if(matchedTodo){
  for(let i=todoID;i<todos.length;i++){
    todos[i].id--;
  }
  nextID--;
  todos=_.without(todos,matchedTodo);
  res.json(todos);
}
else{
  res.status(404).json({"ERROR 404":"ToDo not found!"});
}


});

//Updating a ToDo
app.put("/todos/:id",function(req,res){
  var body=_.pick(req.body,"description","completed");
  var validAttributes={};
  var todoID=parseInt(req.params.id,10);
  var matchedTodo=_.findWhere(todos,{id:todoID});

  if(!matchedTodo){
    return res.status(404).send();
  }

  if(body.hasOwnProperty("completed") && _.isBoolean(body.completed)){
    validAttributes.completed=body.completed;
  }else if(body.hasOwnProperty("completed")){
    return res.status(400).send();
  }

if(body.hasOwnProperty("description") && _.isString(body.description) && body.description.trim().length>0){
  validAttributes.description=body.description;
}else if(body.hasOwnProperty("description")){
  return res.status(400).send();
}

_.extend(matchedTodo, validAttributes);
res.json(matchedTodo);
});


app.listen(port,function(){
  console.log("Express listening on port "+port+"!");
})
