import { rest } from 'msw';

export const base = 'http://test.com';

export const handlers = [
  rest.get(`${base}/test200`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json('success'));
  }),
  rest.get(`${base}/test400`, (req, res, ctx) => {
    return res(ctx.status(400), ctx.json('error'));
  }),
  rest.get(`${base}/test500`, (req, res, ctx) => {
    return res(ctx.status(500), ctx.json('error'));
  }),
  rest.get(`${base}/testNetworkError`, (req, res, ctx) => {
    return res.networkError('network error');
  }),
  rest.get(`${base}/testBlob`, (req, res, ctx) => {
    const buffer = Buffer.from('binary string', 'ascii');
    const accept = req.headers.get('Accept');
    return res(ctx.set({ 'Content-Length': buffer.byteLength.toString(), 'Content-Type': accept }), ctx.body(buffer));
  }),
];
