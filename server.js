var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("./db.js");

var app = express();
var port = process.env.PORT || 3000;
var todos = [];

//Home
app.get("/",function(req,res){
  res.send("Todo API Root");
});

//GET /todos?query
//List out all/ filtered ToDos
app.get("/todos",function(req,res){
  var queryParams = req.query;
  var filteredTodos = todos;

  if(queryParams.hasOwnProperty("completed")){
    var state=(queryParams.completed==="true");
    filteredTodos = _.where(filteredTodos, {"completed":state});
  }

  if(queryParams.hasOwnProperty("q") && queryParams.q.length>0){
    filteredTodos = _.filter(filteredTodos, function(todo){
      return (todo.description.toLowerCase().indexOf(queryParams.q) > -1)
    });
  }

  res.json(filteredTodos);
});

//GET /todos/:id
//Find a single ToDo
app.get("/todos/:id",function(req,res){

  var todoID = parseInt(req.params.id,10);

  db.todo.findById(todoID).then(function(todo){
    if(!!todo){
      res.json(todo.toJSON());
    }else {
      res.status(404).send();
    }
  },function(e){
    res.status(500).send();
  });

  // var matchedTodo = _.findWhere(todos,{id:todoID});
  //
  // if(matchedTodo){
  //   res.json(matchedTodo);
  // }else{
  //   res.status(404).send();
  // }

});

//New ToDo post
var nextID = todos.length+1;
app.use(bodyParser.json());

//POST /todos
app.post("/todos",function(req,res){
  var body = _.pick(req.body,"description","completed");

db.todo.create(body).then(function(todo){
  res.json(todo.toJSON());
}).catch(function(e){
  res.status(400).json(e);
});

  // //validate input
  // if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length===0){
  //   return res.status(400).send();
  // }
  //
  // //remove unnecessary whitespace
  // body.description = body.description.trim();
  //
  // //add ID field
  // body.id = nextID++;
  //
  // //push to ToDos
  // todos.push(body);
  // res.json(body);
});

//Removing a ToDo
//DELETE /todos/:id
app.delete("/todos/:id",function(req,res){

//Find todo
  var todoID=parseInt(req.params.id,10);
  var matchedTodo=_.findWhere(todos,{id:todoID});

  if(matchedTodo){

    //Update the ID numbers
    nextID--;
    for(let i=todoID;i<todos.length;i++){
      todos[i].id--;
    }

    //remove todo
    todos=_.without(todos,matchedTodo);
    res.json(todos);
  }
  else{
    res.status(404).json({"ERROR 404":"ToDo not found!"});
  }
});

//Updating a ToDo
//PUT /todos/:id
app.put("/todos/:id",function(req,res){
  var body=_.pick(req.body,"description","completed");
  var validAttributes={};
  var todoID=parseInt(req.params.id,10);
  var matchedTodo=_.findWhere(todos,{id:todoID});

  if(!matchedTodo){
    return res.status(404).send();
  }

  //Validating
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

  //Updating ToDo details
  _.extend(matchedTodo, validAttributes);
  res.json(matchedTodo);
});

db.sequelize.sync().then(function(){
  app.listen(port,function(){
    console.log("Express listening on port "+port+"!");
  });
});
