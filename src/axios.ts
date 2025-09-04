import axios from 'axios';
import { config } from './config';

const headers: { [key: string]: string } = {
  'Content-Type': 'application/json',
};

if (config.appEnv === 'development') {
  headers['Authorization'] = 'Basic YWRtaW5AZG90Y21zLmNvbTphZG1pbg==';
}

export default axios.create({
  baseURL: config.apiBaseUrl,
  headers,
});

