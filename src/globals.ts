import { Logger } from 'tslog';
import { ColourPalette, Environment } from './types';

export const version: string = process.env.npm_package_version ?? '0.0.0';
export const environment: Environment =
    process.env.NODE_ENV === 'prod' ? 'prod' : 'dev';
export const logger: Logger<unknown> = new Logger({
    prettyLogTemplate: '{{dateIsoStr}} {{logLevelName}}\t',
    minLevel: environment === 'prod' ? 3 : 2, // 2 = debug, 3 = info
});
export const embedColours: ColourPalette = {
    DEBUG: [87, 242, 135],
    INFO: [88, 101, 242],
    WARNING: [254, 231, 92],
    ERROR: [237, 66, 69],
};
