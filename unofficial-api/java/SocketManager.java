/* import io.socket.client.IO;
import io.socket.client.Socket; */
// import java.net.URL;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpClient.Version;
import java.time.Duration;
import java.util.List;

// import javax.net.ssl.HttpsURLConnection;
// import java.io.OutputStream;
//import java.io.InputStream;
public class SocketManager{
    public static final String HOST = "animemusicquiz.com";
    public static final String SOCKET_HOST = "https://socket.animemusicquiz.com";
    public static final URI SIGNIN_URI = URI.create("https://" + HOST + "/signIn");
    public static final URI TOKEN_URI = URI.create("https://" + HOST + "/socketToken");
    
    public SocketManager(String username, String password) throws Exception{
        //get cookie
        String content = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        System.out.println(content);
        HttpClient client = HttpClient.newBuilder()
            .version(Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();
        HttpRequest request = HttpRequest.newBuilder()
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
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0")
            .header("X-Requested-With", "XMLHttpRequest")
            .POST(HttpRequest.BodyPublishers.ofString(content))
            .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        // System.out.println(response.body());
        HttpHeaders responseHeaders = response.headers();
        System.out.println(responseHeaders.toString());
        List<String> cookie = responseHeaders.allValues("set-cookie");

/* 
        //SIGNIN_URL
        String cookie = "yadda yadda"; 

        //get token and port
        //TOKEN_URL
        int tokenPort = 4444;
        int token = "asdf";



        URI socketURI = new URI(SOCKET_HOST + ":" + tokenPort);
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
        .build();
 */
        
    }

    public static void main(String[] args) throws Exception{
        SocketManager a = new SocketManager(args[0], args[1]);
    }
    
}