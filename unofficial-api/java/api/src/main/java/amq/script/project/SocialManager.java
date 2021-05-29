package amq.script.project;

import java.util.Queue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.json.JSONObject;

public class SocialManager{

    protected final SocketManager socket;
    protected final Lock dmLock = new ReentrantLock();
    protected final Condition dmSent = dmLock.newCondition();

    public SocialManager(SocketManager socket){
        this.socket = socket;

        socket.addListener("chat message response", new SocketCommand(){
            //a new dm cannot be sent before the response is received
            @Override
            public void call(JSONObject data){
                /* data: JSONObject
                    * msg : String
                    * target : String
                    * emojis JSONObject
                        * emotes : JSONArray // always empty
                        * customEmojis : JSONArray // always empty
                        * shortCodes : JSONArray // always empty
                */
                dmLock.lock();
                recentDM = false;
                lastDMID++;
                dmSent.notify();
                dmLock.unlock();
            }
        });

    }

    protected final LinkedBlockingQueue<String[]> dmQueue = new LinkedBlockingQueue<String[]>(10000);
    protected boolean recentDM = false;
    protected long lastDMID = 0;

    public boolean queueDM(String message, String target){
        return dmQueue.offer(new String[]{message, target});
    }

    protected void sendDM(String message, String target){
        JSONObject content = new JSONObject();
        content.put("target", target);
        content.put("message", message);
        dmLock.lock();
        while(recentDM){
            dmSent.await();
        }
        socket.sendCommand("chat message", "social", content);
        
        long currentDMID = lastDMID;
        CompletableFuture.delayedExecutor(5, TimeUnit.SECONDS).execute(() -> {
            // after 5 seconds give up on recieveing response, message may be lost, status unknown
            dmLock.lock();
            if(lastDMID == currentDMID){ //only trigger if a response has not been recieved
                recentDM = false;
                dmSent.notify();
            }
            dmLock.unlock();
        });

        dmLock.unlock();
    }
    
    protected class Worker implements Runnable{
        @Override
        public void run(){
            
        }
    }
}