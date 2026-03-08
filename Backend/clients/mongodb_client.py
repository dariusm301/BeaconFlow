import pymongo
import logging

class MongoDBClient:
    def __init__(self, host, port, username, password, db, collection):
        self.log = logging.getLogger(__name__)
        try:
            self.client = pymongo.MongoClient(f"mongodb://{username}:{password}@{host}:{port}/")
            self.db = self.client[db]
            self.collection = self.db[collection]  
            self.log.info("Connected to MongoDB")
        except Exception as e:
            self.log.error(f"Failed to connect to MongoDB: {e}")  
            raise 

    def update_data(self, query_filter, new_data):
        try:
            self.collection.update_one(query_filter, {"$set": new_data}) 
            self.log.info(f"Update in database on {query_filter}")
        except Exception as e:
            self.log.error(f"Failed to update data: {e}")  
            raise

    def save_data(self, data):
        try:
            result = self.collection.insert_one(data)
            self.log.info(f"Data saved with ID: {result.inserted_id}") 
        except Exception as e:
            self.log.error(f"Failed to save data: {e}") 
            raise

    def delete_data(self, query_filter):
        try:
            result = self.collection.delete_one(query_filter)
            self.log.info(f"Data deleted with specifications: {query_filter}")
            return {"deleted_count": result.deleted_count}
        except Exception as e:
            self.log.error(f"Failed to delete data: {e}")

    def get_all(self):
        try:
            result = list(self.collection.find({}, {"_id": 0})) 
            self.log.info(f"Retrieved {len(result)} documents")
            return result
        except Exception as e:
            self.log.error(f"Failed to retrieve data: {e}")
            raise

    def get_data(self, query_filter):
        try:
            result = list(self.collection.find(query_filter,  {"_id": 0}))
            self.log.info(f"Retrived {len(result)} documents")
            return result
        except Exception as e:
            self.log.error(f"Failed to retrieve data: {e}")
            raise

