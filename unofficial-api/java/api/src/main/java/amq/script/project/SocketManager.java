package amq.script.project;

//socket IO related
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
import io.socket.emitter.Emitter.Listener;

//connection related
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpClient.Version;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.json.simple.JSONValue;
import org.json.simple.JSONObject;//these are used for the connection phase, rest of the application uses org.json.JSONObject due to socket.io


//Listener storage handler
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;


public class SocketManager{
    public static final String HOST = "animemusicquiz.com";
    public static final String SOCKET_HOST = "https://socket.animemusicquiz.com";
    public static final URI SIGNIN_URI = URI.create("https://" + HOST + "/signIn");
    public static final URI TOKEN_URI = URI.create("https://" + HOST + "/socketToken");
    public static final URI LOGOUT_URI = URI.create("https://" + HOST + "/signout");
    public static final HttpClient client = HttpClient.newBuilder()
        .version(Version.HTTP_2)
        .connectTimeout(Duration.ofSeconds(10))
        .build();
    public final String cookie;
    public final String token;
    public final int port;
    public final Socket socket;
    public final String username;
    public final Listener commandListener;
    public final boolean debug = true;
    
    public SocketManager(String username, String password) throws Exception{
        this.username = username; //really no point in saving the password
        //get cookie
        String content = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        
        HttpRequest loginRequest = HttpRequest.newBuilder()
            .uri(SIGNIN_URI)
            .version(Version.HTTP_2)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json, text/javascript, */*; q=0.01")
            .header("Accept-Encoding", "gzip, deflate, br")
            .header("Accept-Language", "en-US;q=0.3,en;q=0.1")
            // .header("Connection", "keep-alive")
            // .header("Host", HOST)
            .header("Origin", "https://" + HOST)
            .header("Referer", "https://" + HOST + "/")
            .header("TE", "Trailers")
            .header("User-Agent", "Mozilla/5.0 Java")
            .header("X-Requested-With", "XMLHttpRequest")
            .POST(HttpRequest.BodyPublishers.ofString(content))
            .build();
        
        HttpResponse<String> loginResponse = client.send(loginRequest, HttpResponse.BodyHandlers.ofString());
        HttpHeaders loginResponseHeaders = loginResponse.headers();
        cookie = loginResponseHeaders.allValues("set-cookie").get(0);
        // System.out.println(cookie);

        //use cookie to get token and port
        HttpRequest tokenRequest = HttpRequest.newBuilder()
            .uri(TOKEN_URI)
            .version(Version.HTTP_2)
            .header("Accept", "*/*")
            .header("Accept-Encoding", "gzip, deflate, br")
            .header("Accept-Language", "en-US;q=0.3,en;q=0.1")
            .header("Cache-Control", "max-age=0")
            .header("Cookie", cookie)
            .header("Referer", "https://" + HOST + "/")
            .header("TE", "Trailers")
            .header("User-Agent", "Mozilla/5.0 Java")
            .header("X-Requested-With", "XMLHttpRequest")
            .GET()
            .build();
        HttpResponse<String> tokenResponse = client.send(tokenRequest, HttpResponse.BodyHandlers.ofString());
        String tokenJSON = tokenResponse.body();
        // System.out.println(tokenJSON);
        JSONObject tokenContainer = (JSONObject) JSONValue.parse(tokenJSON);
        token = tokenContainer.get("token").toString();
        port = Integer.parseInt(tokenContainer.get("port").toString());
        URI socketURI = URI.create(SOCKET_HOST + ":" + port);

        IO.Options options = new IO.Options();
        options.forceNew = true;

        // low-level engine options
        options.upgrade = true;
        options.rememberUpgrade = false;
        options.path = "/socket.io/"; //this is the default
        options.query = "token=" + token;

        options.reconnection = true;
        options.reconnectionAttempts = 5;
        options.reconnectionDelay = 1_000;
        options.reconnectionDelayMax = 2_000;
        options.randomizationFactor = 0.5;
        options.timeout = 20_000;

        socket = IO.socket(socketURI, options); 

        socket.on(Socket.EVENT_CONNECT, new Listener() {
            @Override
            public void call(Object... args){
                System.out.println("connected " + username);
            }
        });
        socket.on(Socket.EVENT_CONNECT_ERROR, new Listener() {
            @Override
            public void call(Object... args){
                System.out.println("connection failed for " + username);
            }
        });
        socket.on(Socket.EVENT_DISCONNECT, new Listener() {
            @Override
            public void call(Object... args){
                System.out.println("disconnected " + username);
            }
        });
        addListener("chat message", new SocketCommand(){
            @Override
            public void call(org.json.JSONObject JSON){
                System.out.println("chat message start");
                System.out.println(JSON);
                System.out.println("chat message end");
                logout();
            }
        });
        commandListener = new Listener() {
            @Override
            public void call(Object... args){
                //every single command that comes from amq is under the "command" name, and differentiation has to be done here
                org.json.JSONObject obj = (org.json.JSONObject) args[0];
                if(debug){
                    System.out.println(obj);
                }
                String command = null;
                org.json.JSONObject data = null;
                try{
                    command = obj.getString("command");
                    data = obj.getJSONObject("data");

                }catch(org.json.JSONException e){

                }
                List<SocketCommand> list = listeners.get(command);
                if(list != null){
                    for(SocketCommand c : list){
                        c.call(data);
                    }
                }
                List<SocketCommand> onceList = onceListeners.get(command);
                if(onceList != null){
                    for(SocketCommand c : onceList){
                        c.call(data);
                    }
                    onceListeners.remove(command);
                }
            }
        };
        socket.on("command", commandListener);
        connect();
    }

    public Socket connect(){
        return socket.connect();
    }

    public Socket disconnect(){
        return socket.disconnect();
    }

    public Socket reconnect(){
        return disconnect().connect();
    }

    public void logout(){
        HttpRequest logoutRequest = HttpRequest.newBuilder()
            .uri(LOGOUT_URI)
            .version(Version.HTTP_2)
            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
            .header("Accept-Encoding", "gzip, deflate, br")
            .header("Accept-Language", "en-US;q=0.3,en;q=0.1")
            .header("Cookie", cookie)
            .header("Referer", "https://" + HOST + "/")
            .header("User-Agent", "Mozilla/5.0 Java")
            .GET()
            .build();
        try{
            HttpResponse<String> logoutResponse = client.send(logoutRequest, HttpResponse.BodyHandlers.ofString());
            if(debug){
                System.out.println(logoutResponse.body());
            }
        }catch(Exception e){
            System.out.println("error while logging out");
            System.err.println(e);
        }finally{
            disconnect();
            socket.off();
            socket.close();
        }
    }

    protected final Map<String, List<SocketCommand>> listeners = new HashMap<String, List<SocketCommand>>();
    protected final Map<String, List<SocketCommand>> onceListeners = new HashMap<String, List<SocketCommand>>();
    
    public SocketCommand addListener(String command, SocketCommand callback){
        //adds a listener that triggers every time command is received
        List<SocketCommand> list = listeners.get(command);
        if(list == null){
            list = new ArrayList<SocketCommand>();
            listeners.put(command, list);
        }
        list.add(callback);
        return callback;
    }
    public SocketCommand addOnceListener(String command, SocketCommand callback){
        //adds a listener entry that only triggers once
        List<SocketCommand> list = onceListeners.get(command);
        if(list == null){
            list = new ArrayList<SocketCommand>();
            onceListeners.put(command, list);
        }
        list.add(callback);
        return callback;
    }
    public void removeListener(String command, SocketCommand callback){
        //removes the specified listener for command
        List<SocketCommand> list = listeners.get(command);
        if(list != null){
            list.remove(callback);
        }
        list = onceListeners.get(command);
        if(list != null){
            list.remove(callback);
        }
    }
    public void removeAllListeners(String command){
        //removes all listeners for command
        listeners.remove(command);
        onceListeners.remove(command);
    }
    public void removeAllListeners(){
        //removes all listeners
        listeners.clear();
        onceListeners.clear();
    }

    public Emitter sendCommand(String command, String type, org.json.JSONObject data){
        org.json.JSONObject content = new org.json.JSONObject();
        content.put("command", command);
        content.put("type", type);
        if(data != null){
            content.put("data", data);
        }
        return socket.emit("command", content); //every command is sent as a string saying "command" and a JSON that happens to contain an entry named "command"
    }
    public Emitter sendCommand(String command, String type){
        return this.sendCommand(command, type, null);
    }
}

