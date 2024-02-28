import { publicProcedure, t } from '../root';

const options = t.router({
  greeting: publicProcedure.query(() => 'hello tRPC v10!')
});


export default options