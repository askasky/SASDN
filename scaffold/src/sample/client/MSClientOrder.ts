import * as LibUtil from 'util';
import * as grpc from 'grpc';
import {GatewayContext, RpcContext} from 'sasdn';
import {GrpcInstrumentation} from 'zipkin-instrumentation-grpcjs';

import {OrderServiceClient} from '../../proto/order/order_grpc_pb';
import {GetOrderRequest, Order,} from '../../proto/order/order_pb';
import {TracerHelper} from '../../helper/TracerHelper';
import {ConfigHelper} from "../../helper/ConfigHelper";

export default class MSClientOrder {
    public client: OrderServiceClient;

    constructor(ctx?: GatewayContext | RpcContext) {
        const options = ConfigHelper.instance().getOption();

        this.client = GrpcInstrumentation.proxyClient(
            new OrderServiceClient(`${options.host}:${options.port}`, grpc.credentials.createInsecure()),
            ctx,
            TracerHelper.instance().getTraceInfo(true, 'order')
        );
    }

    public async getOrder(request: GetOrderRequest): Promise<Order> {
        const getOrderPromise: (request: GetOrderRequest) => Promise<Order> = LibUtil.promisify(this.client.getOrder);

        return getOrderPromise(request);
    }
}