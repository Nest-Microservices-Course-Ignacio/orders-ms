import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';

import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: { status: (code: number) => { json: (body: any) => void } } = ctx.getResponse();

    const rpcError = exception.getError() as { status?: number; message?: string };

    if (
      typeof rpcError === 'object' &&
      rpcError.status !== undefined &&
      rpcError.message !== undefined
    ) {
      const status = typeof rpcError.status === 'number' && !isNaN(rpcError.status) ? rpcError.status : 400;
      return response.status(status).json(rpcError);
    }

    response.status(400).json({
      status: 400,
      message: rpcError,
    });
  }
}