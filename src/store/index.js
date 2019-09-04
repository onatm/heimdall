import memorystore from './memory';
import mongostore from './mongo';

export default process.env.NODE_ENV === 'debug' ? memorystore : mongostore;
