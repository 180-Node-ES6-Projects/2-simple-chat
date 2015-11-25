import http from 'http';
import fs  from 'fs';
import sockjs from 'sockjs';
let sockjs_opts = {sockjs_url: "http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js"};

let connections = [];
let chat_server = sockjs.createServer(sockjs_opts);
const push = (list,item) => {
	return [
		...list,
		item
	];
}
const removeFromList = (list,idx) => {
	return [
		...list.slice(0,idx),
		...list.slice(idx+1)
	]
	
}
chat_server.on('connection',(conn)=>{
	connections = push(connections,conn);
	conn.write("SERVER: Welcome to the chat. Please enter your name.");
	conn.on('close', ()=>{
		let idx = connections.indexOf(conn);
		connections = removeFromList(connections,idx);
	});
	conn.on('data',(message)=>{
		connections.forEach((c)=>{
			c.write(message);
		});
	})
});

let port = 18000;
let server = http.createServer((req,res)=>{
	let split = req.url.split('?');
	let url = split[0];
	let params = split[1];
	if(url === '/'){
		url = "index.html";
	}
	console.log(url);
	res.writeHead('text/html');
	fs.readFile(__dirname+'/public/'+url,(err,cnt)=>{
		if(!err){
			res.write(cnt);
			res.end();
		}else{
			res.end("404 - page not found");
		}
	});	
});
chat_server.installHandlers(server,{prefix:'/chat'});
server.listen(port,()=>{
	console.log("Server listening on port ",port);
});