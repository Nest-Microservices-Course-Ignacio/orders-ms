import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  PRODUCTS_SERVICE_HOST: string;
  PRODUCTS_SERVICE_PORT: number;
  NATS_SERVERS: string[];
}

const envVarsSchema = joi
  .object<EnvVars>({
    PORT: joi.number().required(),
    PRODUCTS_SERVICE_HOST: joi.string().required(),
    PRODUCTS_SERVICE_PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true)
  .required();

const result = envVarsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS.split(','),
});
const { error, value } = result as {
  error?: joi.ValidationError;
  value: EnvVars;
};

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
export const envVars: EnvVars = value;
export const envs = {
  port: envVars.PORT,
  productsServiceHost: envVars.PRODUCTS_SERVICE_HOST,
  productsServicePort: envVars.PRODUCTS_SERVICE_PORT,
  natsServers: envVars.NATS_SERVERS,
};
