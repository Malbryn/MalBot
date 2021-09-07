import os

from malbot.app import App

if __name__ == '__main__':
    app = App()
    app.run(os.environ['DISCORD_TOKEN'])
