#!/usr/bin/env node

import * as path from 'path';
import * as crypto from 'crypto';
import * as express from 'express';
import { createMiddleware, createPurpleCheetah } from '@becomes/purple-cheetah';
import type { NextFunction, Request, Response } from 'express';

async function main() {
  const args = process.argv;
  const sec: [string, string] = [
    process.env.USERNAME || crypto.randomBytes(8).toString('base64'),
    process.env.PASSWORD || crypto.randomBytes(8).toString('base64'),
  ];
  let errorPage = process.env.ERROR_PAGE || '404.html';
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--u' && args[i + 1]) {
      sec[0] = args[i + 1];
      i++;
    } else if (arg === '--p' && args[i + 1]) {
      sec[1] = args[i + 1];
      i++;
    } else if (arg === '--ep' && args[i + 1]) {
      errorPage = args[i + 1];
      i++;
    }
  }
  createPurpleCheetah({
    port: 1280,
    middleware: [
      createMiddleware({
        name: 'Auth',
        handler() {
          function doExit(res: Response) {
            res.set('WWW-Authenticate', 'Basic realm="401"'); // change this
            res.status(401).send('Authentication required.'); // custom message
          }
          return async (req: Request, res: Response, next: NextFunction) => {
            if (!req.headers.authorization) {
              doExit(res);
              return;
            }
            const [login, password] = Buffer.from(
              req.headers.authorization.replace('Basic ', ''),
              'base64',
            )
              .toString()
              .split(':');
            if (
              !login ||
              !password ||
              login !== sec[0] ||
              password !== sec[1]
            ) {
              doExit(res);
              return;
            }
            next();
          };
        },
      }),
      createMiddleware({
        name: 'Public',
        handler() {
          return express.static('public');
        },
      }),
      createMiddleware({
        name: 'Not found',
        handler() {
          return async (_req: Request, res: Response) => {
            res.sendFile(path.join(process.cwd(), 'public', errorPage));
          };
        },
      }),
    ],
  });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
