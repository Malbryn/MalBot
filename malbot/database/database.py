import os

import psycopg2


class Database:
    def __init__(self):
        self.conninfo = os.environ['DATABASE_URL']

        self.connection = None
        self.cursor = None

    async def connect(self) -> None:
        print('Connecting to PostgreSQL database...')

        try:
            self.connection = psycopg2.connect(self.conninfo)
            self.cursor = self.connection.cursor()
        except Exception as e:
            print('Connection to database failed: ', e)

    async def disconnect(self) -> None:
        print('Disconnecting from PostgreSQL database...')

        try:
            self.cursor.close()
        except Exception as e:
            print('Disconnecting failed: ', e)

    async def query(self, query_string: str, *args) -> list:
        print('Executing query...')

        data = tuple()

        try:
            self.cursor.execute(query_string, *args)
            if self.cursor.statusmessage == "SELECT 1":
                data = self.cursor.fetchone()

            self.connection.commit()
        except Exception as e:
            print('Query failed: ', e)
        finally:
            return data
