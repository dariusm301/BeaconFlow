import redis
from dotenv import load_dotenv
import logging
import threading

class RedisClient:
    def __init__(self, host, port):
        load_dotenv()
        self.redis_client = redis.Redis(host=host, port=port, decode_responses=True)
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.log = logging.getLogger(__name__)

    def _listen(self, topic : str, message_handler):
        pubsub = self.redis_client.pubsub()
        pubsub.subscribe(topic)
        self.log.info(f"Subscribed to topic: {topic}")
        for raw_message in pubsub.listen():
            if raw_message["type"] == "message":
                message_handler(raw_message["data"])
        

    def subscribe(self, topic_handlers: dict):
        for topic, handler in topic_handlers.items():
            thread = threading.Thread(
                target = self._listen,
                args= (topic, handler),
                daemon = True
            )
            thread.start()
            self.log.info(f"Started listener thread for topic: {topic}")

    def publish(self, topic, data):
        self.redis_client.publish(topic, data)

    def set(self, key, value, **kwargs):
        return self.redis_client.set(key, value, **kwargs)

    def get(self, key):
        return self.redis_client.get(key)

    def delete(self, *keys):
        return self.redis_client.delete(*keys)

    def incr(self, key):
        return self.redis_client.incr(key)

    def decr(self, key):
        return self.redis_client.decr(key)
        
    