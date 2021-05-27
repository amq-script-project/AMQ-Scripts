package amq.script.project;

import org.json.simple.JSONValue;
import org.json.simple.JSONObject;
public class App 
{
    public static void main(String[] args) throws Exception
    {
        SocketManager a = new SocketManager(args[0], args[1]);
    }
}
