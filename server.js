var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("./db.js");
var bcrypt=require("bcrypt");
var middleware=require("./middleware.js")(db);

var app = express();
var port = process.env.PORT || 3000;
var todos = [];


//Home
app.get("/",function(req,res){
  res.send("Todo API Root");
});

//GET /todos?query
//List out all/ filtered ToDos
app.get("/todos",middleware.requireAuthentication,function(req,res){
  var query = req.query;
  var where={};

  if(query.hasOwnProperty("completed")){
    var state=(query.completed==="true");
    where.completed=state;
  }
  if(query.q && query.q.length>0){
    where.description={$like: "%"+query.q+"%"}
  }

  db.todo.findAll({
    where:where
  }).then(function(todos){
    res.json(todos);
  }).catch(function(e){
    res.status(500).send();
  });

});

//GET /todos/:id
//Find a single ToDo
app.get("/todos/:id",middleware.requireAuthentication,function(req,res){

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

});

//New ToDo post
var nextID = todos.length+1;
app.use(bodyParser.json());

//POST /todos
app.post("/todos",middleware.requireAuthentication,function(req,res){
  var body = _.pick(req.body,"description","completed");

  db.todo.create(body).then(function(todo){
    req.user.addTodo(todo).then(function(){
      return todo.reload();
    }).then(function(){
      res.json(todo.toJSON());
    });
  }).catch(function(e){
    res.status(500).send();
  });

});

//Removing a ToDo
//DELETE /todos/:id
app.delete("/todos/:id",middleware.requireAuthentication,function(req,res){

//Find todo
  var todoID=parseInt(req.params.id,10);
  db.todo.destroy({
    where:{
      id: todoID
    }
  }).then(function(rowsDeleted){
    if(rowsDeleted===0){
      res.status(404).json({
        error: "No ToDo with id"
      });
    } else {
      res.status(204).send();
    }
  },function(){
    res.status(500).send();
  }).catch(function(e){
    res.send(e);
  });

});

//Updating a ToDo
//PUT /todos/:id
app.put("/todos/:id",middleware.requireAuthentication,function(req,res){
  var todoID=parseInt(req.params.id,10);
  var body=_.pick(req.body,"description","completed");
  var attributes={};

  if(body.hasOwnProperty("completed")){
    attributes.completed=body.completed;
  }
  if(body.hasOwnProperty("description")){
    attributes.description=body.description;
  }
  //Updating ToDo details
  db.todo.findById(todoID).then(function(todo){

    if(todo){
      todo.update(attributes).then(function(todo){
        res.json(todo.toJSON);
      },function(e){
        res.status(400).json(e);
      });
    }else {
      res.status(404).send();
    }

  },function(){
    res.status(500).send();
  });
});

//Creating a new account
app.post("/users",function(req,res){
  var body= _.pick(req.body,"email","password");

  db.user.create(body).then(function(user){
    res.status(200).json(user.toPublicJSON());
  },function(e){
    res.status(400).json(e);
  });

});

// POST /users/login
app.post("/users/login",function(req,res){
  var body = _.pick(req.body, "email","password");

  db.user.authenticate(body).then(function(user){
    var token =user.generateToken("authentication");
    if(token){
        res.header("Auth", token).json(user.toPublicJSON());
    } else {
      res.status(401).send();
    }
  },function(){
    res.status(401).send();
  });
});

db.sequelize.sync({force:true}).then(function(){
  app.listen(port,function(){
    console.log("Express listening on port "+port+"!");
  });
});
