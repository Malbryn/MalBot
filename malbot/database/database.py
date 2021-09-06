import os

import psycopg2


class Database:
    def __init__(self):
        self.conninfo = os.environ['DATABASE_URL']

        self.connection = None
        self.cursor = None
        self.db_version = None

    def connect(self) -> None:
        print('Connecting to PostgreSQL database...')

        try:
            self.connection = psycopg2.connect(self.conninfo)
            self.cursor = self.connection.cursor()

            self.cursor.execute('SELECT version()')
            self.db_version = self.cursor.fetchone()
            print('PostgreSQL version: ', self.db_version)
        except Exception as e:
            print('Connection to database failed: ', e)

    def disconnect(self) -> None:
        print('Disconnecting from PostgreSQL database...')

        try:
            self.cursor.close()
        except Exception as e:
            print('Disconnecting failed: ', e)

    def query(self, query_string: str) -> list:
        data = []

        try:
            self.cursor.execute(query_string)
            data = self.cursor.fetchone()
        except Exception as e:
            print('Query failed: ', e)
        finally:
            return data
