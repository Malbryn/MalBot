import os
import logging
from pathlib import Path


def init_logger():
    logger = logging.getLogger('discord')
    logger.setLevel(logging.INFO)

    # parent_path = os.path.abspath(os.path.join(os.getcwd(), os.pardir))
    # log_path = os.path.join(parent_path, 'logs')
    #
    # if not os.path.isdir(log_path):
    #     try:
    #         os.mkdir(log_path)
    #         print('Log directory created: ', parent_path)
    #     except OSError as e:
    #         print('Cannot create log directory: ', e)
    #
    # if not os.path.isfile(os.path.join(log_path, 'discord.log')):
    #     try:
    #         Path(os.path.join(log_path, 'discord.log')).touch()
    #     except Exception as e:
    #         print('Cannot create log file: ', e)

    Path(os.path.join('/app/logs/discord.log')).touch()

    handler = logging.FileHandler(filename='/app/logs/discord.log', encoding='utf-8', mode='w')
    handler.setFormatter(logging.Formatter('%(asctime)s:%(levelname)s:%(name)s: %(message)s'))
    logger.addHandler(handler)

    logger.info('Logger is set-up')

    return logger
