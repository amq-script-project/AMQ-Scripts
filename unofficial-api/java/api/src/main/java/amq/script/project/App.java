package amq.script.project;

import org.json.simple.JSONValue;
import org.json.simple.JSONObject;
public class App 
{
    public static void main(String[] args) throws Exception
    {
        JSONObject obj = (JSONObject) JSONValue.parse("{\"token\":\"4969ccf3-621a-4cfd-8edc-beaba3439f4b\",\"port\":\"5003\"}");
        System.out.println(obj);
        // SocketManager a = new SocketManager(args[0], args[1]);
    }
}
