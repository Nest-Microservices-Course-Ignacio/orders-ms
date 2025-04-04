/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    const rpcError = exception.getError() as { status?: number; message?: string };

    if (
      typeof rpcError === 'object' &&
      rpcError.status !== undefined &&
      rpcError.message !== undefined
    ) {
      const status = typeof rpcError.status === 'number' && !isNaN(rpcError.status) ? rpcError.status : 400;
      return {
        status,
        message: rpcError.message,
        data
      };
    }

    return {
      status: 400,
      message: rpcError,
      data
    };
  }
}