import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
}

const envVarsSchema = joi
  .object<EnvVars>({
    PORT: joi.number().required(),
  })
  .unknown(true)
  .required();

const result = envVarsSchema.validate(process.env);
const { error, value } = result as {
  error?: joi.ValidationError;
  value: EnvVars;
};

if (error) {
  throw new Error(`Config validation error: \${error.message}`);
}
export const envVars: EnvVars = value;
export const envs = {
  port: envVars.PORT,
};
