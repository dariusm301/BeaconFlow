import logging
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from dotenv import load_dotenv

load_dotenv()

class InfluxClient:
    def __init__(self, url, token, org, bucket):
        self.log = logging.getLogger(__name__)
        self.org = org
        self.bucket = bucket
        try:
            self.client = InfluxDBClient(url=url, token=token, org=org, bucket=bucket)
            self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
            self.query_api = self.client.query_api()
            self.log.info("Connected to InfluxDB")
        except Exception as e:
            self.log.error(f"Failed to connect to InfluxDB: {e}")
            raise

    def write(self, measurement, tags: dict, fields: dict):
        try:
            point = Point(measurement)
            for key, value in tags.items():
                point = point.tag(key, value)
            for key, value in fields.items():
                point = point.field(key, value)
            self.write_api.write(bucket=self.bucket, org=self.org, record=point)
            self.log.info(f"Data written to measurement: {measurement} | tags: {tags}")
        except Exception as e:
            self.log.error(f"Failed to write data: {e}")
            raise

    def query(self, flux_query):
        try:
            result = self.query_api.query(flux_query, org=self.org)
            records = []
            for table in result:
                for record in table.records:
                    records.append(record.values)
            self.log.info(f"Query returned {len(records)} records")
            return records
        except Exception as e:
            self.log.error(f"Failed to query data: {e}")
            raise

    def get_latest(self, measurement, filters: dict = None, range_minutes=60):
        try:
            filter_str = f'|> filter(fn: (r) => r._measurement == "{measurement}")'
            if filters:
                for key, value in filters.items():
                    filter_str += f'\n  |> filter(fn: (r) => r.{key} == "{value}")'
            flux = f'''
                from(bucket: "{self.bucket}")
                  |> range(start: -{range_minutes}m)
                  {filter_str}
                  |> last()
            '''
            return self.query(flux)
        except Exception as e:
            self.log.error(f"Failed to get latest data: {e}")
            raise

    def close(self):
        try:
            self.client.close()
            self.log.info("InfluxDB connection closed")
        except Exception as e:
            self.log.error(f"Failed to close InfluxDB connection: {e}")