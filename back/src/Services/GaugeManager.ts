import {Counter, Gauge} from "prom-client";
import { StatsD } from 'hot-shots';

const ACTIVE_ROOMS_GAUGE_NAME = 'rooms.active';
const SOCKETS_GAUGE_NAME = 'sockets.connected';

//this class should manage all the custom metrics used by prometheus/statsd
class GaugeManager {
    // Prometheus
    private nbClientsGauge: Gauge<string>;
    private nbClientsPerRoomGauge: Gauge<string>;
    private nbGroupsPerRoomGauge: Gauge<string>;
    private nbGroupsPerRoomCounter: Counter<string>;
    private nbRoomsGauge: Gauge<string>;

    // StatsD
    private client: StatsD;

    constructor() {
        this.nbRoomsGauge = new Gauge({
            name: 'workadventure_nb_rooms',
            help: 'Number of active rooms'
        });
        this.nbClientsGauge = new Gauge({
            name: 'workadventure_nb_sockets',
            help: 'Number of connected sockets',
            labelNames: [ ]
        });
        this.nbClientsPerRoomGauge = new Gauge({
            name: 'workadventure_nb_clients_per_room',
            help: 'Number of clients per room',
            labelNames: [ 'room' ]
        });

        this.nbGroupsPerRoomCounter = new Counter({
            name: 'workadventure_counter_groups_per_room',
            help: 'Counter of groups per room',
            labelNames: [ 'room' ]
        });
        this.nbGroupsPerRoomGauge = new Gauge({
            name: 'workadventure_nb_groups_per_room',
            help: 'Number of groups per room',
            labelNames: [ 'room' ]
        });

        this.client = new StatsD({
            host: process.env.STATSD_HOST || 'localhost',
            port: 8125,
            prefix: process.env.STATSD_PREFIX || 'showpad_adventure.',
            mock: process.env.NODE_ENV !== 'production' || process.env.STATSD_ENABLED !== "true",
            globalTags: {},
            errorHandler(error: Error): void {
                console.error(error);
            },
        })
    }

    incNbRoomGauge(): void {
        this.nbRoomsGauge.inc();
        this.client.increment(ACTIVE_ROOMS_GAUGE_NAME);
    }

    decNbRoomGauge(): void {
        this.nbRoomsGauge.dec();
        this.client.decrement(ACTIVE_ROOMS_GAUGE_NAME);
    }

    incNbClientPerRoomGauge(roomId: string): void {
        this.nbClientsGauge.inc();
        this.nbClientsPerRoomGauge.inc({ room: roomId });
    }

    decNbClientPerRoomGauge(roomId: string): void {
        this.nbClientsGauge.dec();
        this.nbClientsPerRoomGauge.dec({ room: roomId });
    }

    incNbGroupsPerRoomGauge(roomId: string): void {
        this.nbGroupsPerRoomCounter.inc({ room: roomId })
        this.nbGroupsPerRoomGauge.inc({ room: roomId })
    }

    decNbGroupsPerRoomGauge(roomId: string): void {
        this.nbGroupsPerRoomGauge.dec({ room: roomId })
    }

    currentSocketsConnectedGauge(totalUsersCount: number): void {
        this.client.gauge(SOCKETS_GAUGE_NAME, totalUsersCount);
    }
}

export const gaugeManager = new GaugeManager();
