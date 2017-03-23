var express=require("express");
var bodyParser = require("body-parser");
var app=express();
var port=process.env.PORT || 3000;



var todos=[
{
  id:1,
  description:"Meet mom for lunch",
  completed:false
},
{
  id:2,
  description:"Go to market",
  completed:false
},
{
  id:3,
  description:"Make dinner",
  completed:true
}
];
app.get("/",function(req,res){
  res.send("Todo API Root");
});

app.get("/todos",function(req,res){
  res.json(todos);
});

app.get("/todos/:id",function(req,res){
  var todoID=parseInt(req.params.id,10);
  todos.forEach(function(todo){
    if(todo.id===todoID){
      res.json(todo);
    }
  });
  res.status(404).send();
});

var nextID=todos.length+1;
//POST new ToDo
app.use(bodyParser.json());

app.post("/todos",function(req,res){
  var body=req.body;
  body.id=nextID++;
  todos.push(body);
  res.json(body);
})

app.listen(port,function(){
  console.log("Express listening on port "+port+"!");
})
