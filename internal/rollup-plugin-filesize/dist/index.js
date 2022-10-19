import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import * as process from 'node:process';
import pacote from 'pacote';
import { minify } from 'terser';
import zlib, { brotliCompress, constants } from 'node:zlib';
import { filesize as filesize$1 } from 'filesize';
import CliTable from 'cli-table';
import { cyan, red, green, white, bold } from 'colorette';

const bufferFormatter = (incoming) => {
    return typeof incoming === 'string' ? Buffer.from(incoming, 'utf8') : incoming;
};
const optionFormatter = (passed, toEncode) => ({
    params: {
        [constants.BROTLI_PARAM_MODE]: (passed && 'mode' in passed && passed.mode) || constants.BROTLI_DEFAULT_MODE,
        [constants.BROTLI_PARAM_QUALITY]: (passed && 'quality' in passed && passed.quality) || constants.BROTLI_MAX_QUALITY,
        [constants.BROTLI_PARAM_SIZE_HINT]: toEncode ? toEncode.byteLength : 0,
    },
});
const brotliSize = (incoming, options) => {
    const buffer = bufferFormatter(incoming);
    return new Promise((resolve, reject) => {
        brotliCompress(buffer, optionFormatter(options, buffer), (error, result) => {
            if (error !== null) {
                reject(error);
            }
            resolve(result.byteLength);
        });
    });
};

const formatSize = (value) => {
    return filesize$1(value, { output: 'array', exponent: 0 });
};

const gzipSize = (input) => {
    return zlib.gzipSync(input, { level: 9 }).length;
};

const row = (title, sizeCurrent, sizeBefore) => {
    const size = [cyan(sizeCurrent.join(' '))];
    if (sizeBefore) {
        size.push(cyan(sizeBefore.join(' ')));
        const [valueCurrent, symbol] = sizeCurrent;
        const [valueBefore] = sizeBefore;
        const diff = valueCurrent - valueBefore;
        size.push(diff > 0 ? red(`+${diff} ${symbol}`) : green(`${diff} ${symbol}`));
    }
    return { [white(title)]: size };
};

const table = async (info) => {
    const cliTable = new CliTable({
        head: [
            `${bold(white('File:'))} ${green(info.file)}`,
            bold(white('Current version')),
            bold(white(`Last version${info.lastVersion ? ` (${info.lastVersion})` : ''}`)),
            bold(white('Size diff')),
        ],
    });
    cliTable.push(row('Bundle size', info.bundleSize, info.bundleSizeBefore));
    if (info.minSize) {
        cliTable.push(row('Minified size', info.minSize, info.minSizeBefore));
    }
    if (info.gzipSize) {
        cliTable.push(row('Gzip size', info.gzipSize, info.gzipSizeBefore));
    }
    if (info.brotliSize) {
        cliTable.push(row('Brotli size', info.brotliSize, info.brotliSizeBefore));
    }
    return cliTable.toString();
};

const getStrings = async (outputOptions, chunk) => {
    const info = {
        file: outputOptions.file || 'N/A',
        bundleSize: formatSize(Buffer.byteLength(chunk.code)),
        brotliSize: formatSize(await brotliSize(chunk.code)),
    };
    const url = new URL(path.join(process.cwd(), './package.json'), import.meta.url);
    const { name } = JSON.parse(await readFile(url, 'utf-8'));
    if (!name) {
        throw new Error('Package name is not defined');
    }
    try {
        const { version } = await pacote.manifest(`${name}@latest`);
        info.lastVersion = version;
    }
    catch (error) {
        console.error(error);
    }
    const minifiedCode = (await minify(chunk.code)).code;
    if (minifiedCode) {
        info.minSize = formatSize(minifiedCode.length);
        info.gzipSize = formatSize(gzipSize(minifiedCode));
    }
    let file = outputOptions.file || '';
    try {
        const output = path.join(process.cwd(), './file-size-cache');
        await pacote.extract(`${name}@latest`, output);
        file = path.resolve(output, file);
    }
    catch (error) {
        console.error(error);
        file = '';
    }
    if (file && (await stat(file)).isFile()) {
        try {
            const codeBefore = await readFile(file, 'utf8');
            if (codeBefore) {
                info.bundleSizeBefore = formatSize(Buffer.byteLength(codeBefore));
                info.brotliSizeBefore = formatSize(await brotliSize(codeBefore));
                const minifiedCodeBefore = (await minify(codeBefore)).code;
                if (minifiedCodeBefore) {
                    info.minSizeBefore = formatSize(minifiedCodeBefore.length);
                    info.gzipSizeBefore = formatSize(gzipSize(minifiedCodeBefore));
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    return table(info);
};
const filesize = () => {
    const plugin = {
        name: 'filesize',
    };
    if (process.env.FILESIZE === 'true') {
        plugin.generateBundle = async (outputOptions, bundle) => {
            Promise.all(Object.keys(bundle)
                .map(fileName => bundle[fileName])
                .filter((currentBundle) => currentBundle && currentBundle.type !== 'asset')
                .map(currentBundle => getStrings(outputOptions, currentBundle))).then(strings => {
                strings.forEach(str => {
                    if (str) {
                        console.log(str);
                    }
                });
            });
        };
    }
    return plugin;
};

export { filesize };
