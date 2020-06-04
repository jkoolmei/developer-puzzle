/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from 'hapi';
import { environment } from './environments/environment';
const axios = require('axios');

const init = async () => {
  const server = new Server({
    port: 3333,
    host: 'localhost',
    routes: {
      cors: true
    }
  });

  const cache = server.cache({ segment: 'stockData', expiresIn: 60 * 60 * 1000 });
  server.route({
    method: 'GET',
    path: '/beta/stock/{symbol}/chart/{period}',
    handler: async (request, h) => {
      const {symbol, period} = request.params;
      const url = `https://sandbox.iexapis.com/beta/stock/${symbol}/chart/${period}?token=${environment.apiKey}`;

      const cacheId = symbol + period;
      const cached = await cache.get(cacheId);
      if (cached) {
        return cache.get(cacheId);
      }

      return axios.get(url).then(function (resp) {
        cache.set(cacheId, resp.data);
        return resp.data;
      });
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
