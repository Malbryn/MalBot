import { Logger } from 'tslog';
import { config } from './config/config';
import { App } from './app';

export const logger: Logger<unknown> = new Logger(config.LOGGER_SETTINGS);

const app: App = new App();
app.start();
