// Reuse Next's existing JSX compiler; no additional test dependencies.
import { readFile } from 'node:fs/promises';
import swc from 'next/dist/build/swc/index.js';

export const resolve = async (specifier, context, next) => {
    try {
        return await next(specifier, context);
    } catch (error) {
        if (!specifier.startsWith('.')) throw error;
        for (const suffix of ['.js', '.jsx', '/index.js']) {
            try { return await next(specifier + suffix, context); } catch { /* Try the next extension. */ }
        }
        throw error;
    }
};

export const load = async (url, context, next) => {
    if (!url.endsWith('.jsx')) return next(url, context);
    const source = await readFile(new URL(url), 'utf8');
    const result = await swc.transform(source, {
        filename: new URL(url).pathname,
        jsc: { target: 'es2022', parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
        module: { type: 'es6' },
    });
    return { format: 'module', source: result.code, shortCircuit: true };
};
