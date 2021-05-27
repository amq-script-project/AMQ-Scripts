package amq.script.project;
import org.json.JSONObject; //inherited from the socket.io module

public interface SocketCommand{
    public void call(JSONObject data);
}