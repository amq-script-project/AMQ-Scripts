package amq.script.project;
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
// import java.net.URL;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpClient.Version;
import java.time.Duration;
import java.util.List;

import org.json.simple.JSONValue;
import org.json.simple.JSONObject;

// import javax.net.ssl.HttpsURLConnection;
// import java.io.OutputStream;
//import java.io.InputStream;
public class SocketManager{
    public static final String HOST = "animemusicquiz.com";
    public static final String SOCKET_HOST = "https://socket.animemusicquiz.com";
    public static final URI SIGNIN_URI = URI.create("https://" + HOST + "/signIn");
    public static final URI TOKEN_URI = URI.create("https://" + HOST + "/socketToken");
    public static final HttpClient client = HttpClient.newBuilder()
        .version(Version.HTTP_2)
        .connectTimeout(Duration.ofSeconds(10))
        .build();
    public final String cookie;
    public final String token;
    public final int port;
    public final Socket socket;
    
    public SocketManager(String username, String password) throws Exception{
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
        System.out.println(token);
        System.out.println(port);


        URI socketURI = URI.create(SOCKET_HOST + ":" + port);
        /* //sadly 1.0.1 (which is required to support socket-io 2) does not support the builder
        // keeping the code in case AMQ ever upgrades
        IO.Options options = IO.Options.builder()
        .setForceNew(true) //the server uses only one namespace, thus we only need one manager

        // low-level engine options
        .setUpgrade(true)
        .setRememberUpgrade(false)
        .setPath("/socket.io/") //default value
        .setQuery("token=" + token)
        .setExtraHeaders(null)

        // Manager options
        .setReconnection(true)
        .setReconnectionAttempts(5)
        .setReconnectionDelay(1_000)
        .setReconnectionDelayMax(2_000)
        .setRandomizationFactor(0.5)
        .setTimeout(20_000)

        // Socket options
        .setAuth(null)
        .build(); */

        IO.Options options = new IO.Options();
        options.forceNew = true;

        // low-level engine options
        options.upgrade = true;
        options.rememberUpgrade = false;
        options.path = "/socket.io/"; //this is the default
        options.query = "token=" + token;
        // options.extraHeaders = null;

        options.reconnection = true;
        options.reconnectionAttempts = 5;
        options.reconnectionDelay = 1_000;
        options.reconnectionDelayMax = 2_000;
        options.randomizationFactor = 0.5;
        options.timeout = 20_000;


        // options.auth = null;

        socket = IO.socket(socketURI, options); 

        socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args){
                System.out.println("success");
                System.out.println(args);
            }
        });
        socket.on(Socket.EVENT_CONNECT_ERROR, new Emitter.Listener() {
            @Override
            public void call(Object... args){
                System.out.println("failure");
                System.out.println(args);
            }
        });
        socket.on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args){
                System.out.println("disconnect");
                System.out.println(args);
            }
        });
        socket.connect();

        Thread.sleep(4000);

        socket.disconnect();
    }
    
    public void addListener(String command, Emitter.Listener listener){
        //adds a listener that triggers every time command is recieved
        socket.on(command, listener);
    }
    public void addOneTimeListener(String command, Emitter.Listener listener){
        //adds a listener that only triggers once
        socket.once(command, listener);
    }
    public void removeListener(String command, Emitter.Listener listener){
        //removes the specified listener for command
        socket.off(command, listener);
    }
    public void removeAllListeners(String command){
        //removes all listeners for command
        socket.off(command);
    }
    public void removeAllListeners(){
        //removes all listeners
        socket.off();
    }

    public Emitter sendCommand(String command, String type, JSONObject data){
        JSONObject content = new JSONObject();
        content.put("command", command);
        content.put("type", type);
        if(data != null){
            content.put("data", data);
        }
        return socket.emit("command", content.toString()); //every command is sent as a string saying "command" and a JSON that happens to contain an entry named "command"
    }
    public Emitter sendCommand(String command, String type){
        return this.sendCommand(command, type, null);
    }
}

