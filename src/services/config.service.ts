import yaml from 'js-yaml';
import * as fs from 'node:fs';
import path from 'path';
import { environment, logger } from '../globals';
import { Config } from '../types';

export class ConfigService {
    private static _instance: ConfigService;

    private readonly CONFIG_FILE = `config.${environment}.yml`;

    private _config: Config;

    private constructor() {
        this._config = this.initConfig();
    }

    get<T extends keyof Config>(key: T): Config[T] {
        return this._config[key];
    }

    public static getInstance(): ConfigService {
        if (!ConfigService._instance) {
            ConfigService._instance = new ConfigService();
        }

        return ConfigService._instance;
    }

    private initConfig(): Config {
        logger.info(
            `Initialising config service [Config: ${this.CONFIG_FILE}]`,
        );

        const configPath = path.join(
            __dirname,
            '..',
            '..',
            'config',
            this.CONFIG_FILE,
        );
        let configFile = '';

        try {
            configFile = fs.readFileSync(configPath, 'utf-8');
        } catch (error) {
            logger.error(`Failed to parse config: ${error}`);
        }

        return yaml.load(configFile) as Config;
    }
}
