const express = require('express');
const app = express();
app.use(express.json());//this line of code is used to parse incoming JSON requests and make the data available in req.body. It allows the server to handle JSON payloads sent by clients in their requests.it is a middleware function provided by the Express framework that automatically parses the JSON data in the request body and makes it accessible as a JavaScript object. This is particularly useful when building APIs that expect clients to send data in JSON format, as it simplifies the process of extracting and working with that data within your route handlers.

app.use((req,res,next)=>{
    console.log(`{req.method} and {req.path} for {req.url}`);//this method is used to log the HTTP method, path, and URL of incoming requests to the console. It helps in monitoring and debugging the requests made to the server. The log message will display the method (e.g., GET, POST), the path (e.g., /members), and the full URL of the request. This information can be useful for tracking the flow of requests through the application and identifying any issues or unexpected behavior.
   next();// this line is used to pass control to the next middleware function in the stack. It allows the request to continue through the middleware chain and reach the appropriate route handler or subsequent middleware functions. Without calling next(), the request would be left hanging, and the server would not respond to the client. By invoking next(), we ensure that the request can proceed to the next middleware or route handler for further processing.
});

app.get('/members',(req,res)=>{
    res.json([])//this helps in
    //sending a response in JSON format to the client when they make a GET request to the '/members' endpoint. In this case, it sends an empty array as the response.
});//this 

app.listen(4000,()=>{
    console.log('Server is running on port 4000');
})

//middleware is a function that has access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. Middleware functions can perform various tasks, such as executing code, modifying the request and response objects, ending the request-response cycle, or calling the next middleware function in the stack. In this case, express.json() is a built-in middleware function that parses incoming requests with JSON payloads and is based on body-parser. It makes it easier to work with JSON data sent by clients in their requests.