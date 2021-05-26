import io.socket.client.IO;
import io.socket.client.Socket;
import java.net.URL;
import java.net.HttpURLConnection;
public class SocketManager{
    public static final String HOST = "animemusicquiz.com";
    public static final String SOCKET_HOST = "https://socket.animemusicquiz.com";
    public static final URL SIGNIN_URL = new URL("https", HOST, -1, "signIn");
    public static final URL TOKEN_URL = new URL("https", HOST, -1, "socketToken");

    public SocketManager(String username, String password){
        //get cookie
        int contentLength = 55555;
        HttpURLConnection loginConnection = SIGNIN_URL.openConnection();
        loginConnection.setRequestMethod("POST");
        loginConnection.setRequestProperty("Content-Type", "application/json");
        loginConnection.setRequestProperty("Content-Length", String.valueOf(contentLength));
        loginConnection.setRequestProperty("Accept", "application/json, text/javascript, */*; q=0.01");
        loginConnection.setRequestProperty("Accept-Encoding", "gzip, deflate, br");
        loginConnection.setRequestProperty("Accept-Language", "en-US;q=0.3,en;q=0.1");
        loginConnection.setRequestProperty("Connection", "keep-alive");
        loginConnection.setRequestProperty("Host", SIGNIN_URL.getHost());
        loginConnection.setRequestProperty("Origin", SIGNIN_URL.getProtocol() + "://" + SIGNIN_URL.getHost());
        loginConnection.setRequestProperty("Referer", SIGNIN_URL.getProtocol() + "://" + SIGNIN_URL.getHost() + "/");
        loginConnection.setRequestProperty("TE", "Trailers");
        loginConnection.setRequestProperty("User-Agent", "Mozilla/5.0");
        loginConnection.setRequestProperty("X-Requested-With", "XMLHttpRequest");
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

        
    }

    
}