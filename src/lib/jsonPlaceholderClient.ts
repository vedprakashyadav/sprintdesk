import axios from 'axios';

const BASE_URL = import.meta.env.VITE_JSONPLACEHOLDER_BASE_URL ?? 'https://jsonplaceholder.typicode.com';

// Deliberately separate from httpClient: this API is only ever used to
// simulate new-notification events via polling, per the assignment brief.
export const jsonPlaceholderClient = axios.create({ baseURL: BASE_URL });
