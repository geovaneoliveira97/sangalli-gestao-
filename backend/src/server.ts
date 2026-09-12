import 'dotenv/config';
import { createApp } from './app';

const app = createApp();
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Sangalli Gestão API rodando em http://localhost:${port}`);
});
