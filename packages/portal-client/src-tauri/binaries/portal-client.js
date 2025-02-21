import { SignableENR as D } from "@chainsafe/enr";
import { keys as M } from "@libp2p/crypto";
import { multiaddr as b } from "@multiformats/multiaddr";
import { formatBlockResponse as O, PortalNetwork as Y, TransportLayer as P, NetworkId as I } from "portalnetwork";
import A from "debug";
import { createSocket as H } from "dgram";
const Q = {
  mainnet: [
    "enr:-I24QO4X4ECNw19M51l3UYjQPq91dwy7FzEdOb43xEjvGnJMOU2cqD-KQ0FNZbpuzRWyQRiqLinAWw2qsgnRQ2guLt0EY4d1IDAuMC4xgmlkgnY0gmlwhKRc9_OJc2VjcDI1NmsxoQOdan7kE4_KU8yM1SNzw9OIrd-oQOlDBnz01fA2fz_1yoN1ZHCCE44",
    "enr:-I24QFm1w_fuMnMf4DsUr_PDVzn_Kn_PY6zQYsoWkJIk4evHUxO8OBacbdo4-7bAyvrXsYgCmOVgOQulvA_9ompMfc8EY4d1IDAuMC4xgmlkgnY0gmlwhKRc9_OJc2VjcDI1NmsxoQPeFHF3dY24vc0QgrRIM1vz3ZFnbmddmKLjhP34pxaD5YN1ZHCCE40",
    "enr:-I24QEkyh8nyn2PLMokMXzc_zpuiYxN2VHKrGfU7YI60K9_5YoGZsq-kSngZqLHeOWP3La-Pt5zaojutlsbbsbZ30dYEY4d1IDAuMC4xgmlkgnY0gmlwhKRc9_OJc2VjcDI1NmsxoQM-ccaM0TOFvYqC_RY_KhZNhEmWx8zdf6AQALhKyMVyboN1ZHCCE4w",
    "enr:-I24QDoMcfNTC3xoH_TSmALXS4WMybTM5SQrysabBxR1DG_UaXHVRHtpQdiGNhxqjHvfSONhnPETB8HorZYplIluDS0EY4d1IDAuMC4xgmlkgnY0gmlwhKRc9_OJc2VjcDI1NmsxoQOImp2idIf2UoY-GoY49pOeJAtqeeDLfb5VDxj94h_I44N1ZHCCE48",
    "enr:-I24QHZRM9Sd3UgUOdB443q3nX6NOUsg0VMyarcfD69z8M3SB1vW2hkqiPFczPpyY6wSUCcUeXTig75sC5fT4YnsL7MEY4d1IDAuMC4xgmlkgnY0gmlwhKRc9_OJc2VjcDI1NmsxoQMGuOLosx85PYtBn7rULoHY9EAtLmGTn7XWoIvFqvq4qIN1ZHCCE5A",
    "enr:-I24QGMQnf1FhP_-tjr7AdT3aJbowJeowuAktBOmoTaxu3WsNPlB1MaD704orcQO8kncLKhEQPOCTv1LSkU27AUldyoEY4d1IDAuMC4xgmlkgnY0gmlwhKRc9-KJc2VjcDI1NmsxoQLJhXByb3LmxHQaqgLDtIGUmpANXaBbFw3ybZWzGqb9-IN1ZHCCE4k",
    "enr:-I24QNw9C_xJvljho0dO27ug7-wZg7KCN1Mmqefdvqwxxqw3X-SLzBO3-KvzCbGFFJJMDn1be6Hd-Bf_TR3afjrwZ7UEY4d1IDAuMC4xgmlkgnY0gmlwhKRc9-KJc2VjcDI1NmsxoQJMpHmGj1xSP1O-Mffk_jYIHVcg6tY5_CjmWVg1gJEsPIN1ZHCCE4o",
    "enr:-I24QOz_tsZ8kOSU_zxXh2HOAxLyAIOeqHZP3Olzgsu73uMRTh8ul7sigT4Q1LaiT12Me2BFm5a4Izi6PCR0_Xe9AHUEY4d1IDAuMC4xgmlkgnY0gmlwhKRc9_OJc2VjcDI1NmsxoQIdyr0pquxuEW1mHQC0_j0mjB1fIfWZEZLlr7nfaKQXLYN1ZHCCE5E",
    "enr:-I24QD_1X6GriBdbJzOb5bgKqwrZyKHmemXo6OD5h6rmajHhcx0nTEMhqza6BaCA5DNXOi58wszHenV2pIXSTkvGaEsEY4d1IDAuMC4xgmlkgnY0gmlwhKRc9_OJc2VjcDI1NmsxoQNliw-242ySvi8lxyNOfrkfkC071-aS8iMAYd82EZ1SLYN1ZHCCE5I",
    "enr:-I24QMeElaS4lKvAtYQYmqBkvUc516OLykrLq0DNrw2kuB00EZVXAgFNGlvNz2U1gqVIMzgNg73RPK2j7UT6388HbdcEY4d1IDAuMC4xgmlkgnY0gmlwhKRc9-KJc2VjcDI1NmsxoQKb1jKQ-3sdzLAIL-a-KM4zTVnmgGIKLuKlh61UGoU8jYN1ZHCCE40",
    "enr:-I24QKRKw-asojN9E1YCyJnsyzERVqhnwWFXBobI7E91-LAqFx9IqouzXszzuuh_Q0WzbqFkR32pgCSmPezXcAPeFI0EY4d1IDAuMC4xgmlkgnY0gmlwhKRc9-KJc2VjcDI1NmsxoQMzvDQGNzKQSw3uGSZE86LqS5Xm5KYByI56NOZzTwWiRoN1ZHCCE4w",
    "enr:-I24QK_aSBXvKCAdMsrRioJDSPlJEl79fO5VX2JTrZEks2gbcrarbdfkWMMyEoS_2879w9bnJ14iC9hA6UWexjQ25IYEY4d1IDAuMC4xgmlkgnY0gmlwhKRc9_OJc2VjcDI1NmsxoQJxPJGDYLZ_QTU310eORFp6-NEs6ThGXpNULnAXPyiKy4N1ZHCCE4o",
    "enr:-I24QDT851x-fW12txAIkCOhq5guf9iMkY7qasRkxfECFsVGS9GnGf_xhy40rAB2aFV8M1kbAo0UMGs-vlDx1JJ1lxQEY4d1IDAuMC4xgmlkgnY0gmlwhKRc9-KJc2VjcDI1NmsxoQKJUamKYO0FWvhv_-H4p1nLdyAqXZWGEzkb9Lk7NtvrR4N1ZHCCE4s",
    "enr:-I24QKa9-vJDAoEiZ4Eio0_z1_fH5OoCAY0mqIuBJ9iJOt9QXie9sAZbrrouToPwTu9hK1CukT7H-qBfdlzMVG2ryy8EY4d1IDAuMC4xgmlkgnY0gmlwhKRc9_OJc2VjcDI1NmsxoQKHPt5CQ0D66ueTtSUqwGjfhscU_LiwS28QvJ0GgJFd-YN1ZHCCE4k",
    "enr:-I24QDs2O04xIlgNMLYzChw-YEcsOsVvkuAYVosX4CoDrFGlMbJQHfrodqYH7TvjZ8v1sNUaiG_7mD8LqFsMGhYf80UEY4d1IDAuMC4xgmlkgnY0gmlwhKRc9_OJc2VjcDI1NmsxoQO7DZE841adtMdh8qsDYCDyTjGLud1HZJg-P-OAbTDVz4N1ZHCCE4s"
  ]
};
function K(u) {
  return u && u.__esModule && Object.prototype.hasOwnProperty.call(u, "default") ? u.default : u;
}
var N = { exports: {} }, v;
function R() {
  return v || (v = 1, function(u) {
    var t = Object.prototype.hasOwnProperty, e = "~";
    function r() {
    }
    Object.create && (r.prototype = /* @__PURE__ */ Object.create(null), new r().__proto__ || (e = !1));
    function h(a, o, s) {
      this.fn = a, this.context = o, this.once = s || !1;
    }
    function y(a, o, s, i, p) {
      if (typeof s != "function")
        throw new TypeError("The listener must be a function");
      var g = new h(s, i || a, p), l = e ? e + o : o;
      return a._events[l] ? a._events[l].fn ? a._events[l] = [a._events[l], g] : a._events[l].push(g) : (a._events[l] = g, a._eventsCount++), a;
    }
    function f(a, o) {
      --a._eventsCount === 0 ? a._events = new r() : delete a._events[o];
    }
    function c() {
      this._events = new r(), this._eventsCount = 0;
    }
    c.prototype.eventNames = function() {
      var o = [], s, i;
      if (this._eventsCount === 0) return o;
      for (i in s = this._events)
        t.call(s, i) && o.push(e ? i.slice(1) : i);
      return Object.getOwnPropertySymbols ? o.concat(Object.getOwnPropertySymbols(s)) : o;
    }, c.prototype.listeners = function(o) {
      var s = e ? e + o : o, i = this._events[s];
      if (!i) return [];
      if (i.fn) return [i.fn];
      for (var p = 0, g = i.length, l = new Array(g); p < g; p++)
        l[p] = i[p].fn;
      return l;
    }, c.prototype.listenerCount = function(o) {
      var s = e ? e + o : o, i = this._events[s];
      return i ? i.fn ? 1 : i.length : 0;
    }, c.prototype.emit = function(o, s, i, p, g, l) {
      var m = e ? e + o : o;
      if (!this._events[m]) return !1;
      var n = this._events[m], w = arguments.length, k, d;
      if (n.fn) {
        switch (n.once && this.removeListener(o, n.fn, void 0, !0), w) {
          case 1:
            return n.fn.call(n.context), !0;
          case 2:
            return n.fn.call(n.context, s), !0;
          case 3:
            return n.fn.call(n.context, s, i), !0;
          case 4:
            return n.fn.call(n.context, s, i, p), !0;
          case 5:
            return n.fn.call(n.context, s, i, p, g), !0;
          case 6:
            return n.fn.call(n.context, s, i, p, g, l), !0;
        }
        for (d = 1, k = new Array(w - 1); d < w; d++)
          k[d - 1] = arguments[d];
        n.fn.apply(n.context, k);
      } else {
        var _ = n.length, E;
        for (d = 0; d < _; d++)
          switch (n[d].once && this.removeListener(o, n[d].fn, void 0, !0), w) {
            case 1:
              n[d].fn.call(n[d].context);
              break;
            case 2:
              n[d].fn.call(n[d].context, s);
              break;
            case 3:
              n[d].fn.call(n[d].context, s, i);
              break;
            case 4:
              n[d].fn.call(n[d].context, s, i, p);
              break;
            default:
              if (!k) for (E = 1, k = new Array(w - 1); E < w; E++)
                k[E - 1] = arguments[E];
              n[d].fn.apply(n[d].context, k);
          }
      }
      return !0;
    }, c.prototype.on = function(o, s, i) {
      return y(this, o, s, i, !1);
    }, c.prototype.once = function(o, s, i) {
      return y(this, o, s, i, !0);
    }, c.prototype.removeListener = function(o, s, i, p) {
      var g = e ? e + o : o;
      if (!this._events[g]) return this;
      if (!s)
        return f(this, g), this;
      var l = this._events[g];
      if (l.fn)
        l.fn === s && (!p || l.once) && (!i || l.context === i) && f(this, g);
      else {
        for (var m = 0, n = [], w = l.length; m < w; m++)
          (l[m].fn !== s || p && !l[m].once || i && l[m].context !== i) && n.push(l[m]);
        n.length ? this._events[g] = n.length === 1 ? n[0] : n : f(this, g);
      }
      return this;
    }, c.prototype.removeAllListeners = function(o) {
      var s;
      return o ? (s = e ? e + o : o, this._events[s] && f(this, s)) : (this._events = new r(), this._eventsCount = 0), this;
    }, c.prototype.off = c.prototype.removeListener, c.prototype.addListener = c.prototype.on, c.prefixed = e, c.EventEmitter = c, u.exports = c;
  }(N)), N.exports;
}
var z = R();
const S = /* @__PURE__ */ K(z), x = 1460;
class L extends S {
  emit(t, ...e) {
    return super.emit(t, ...e);
  }
  socket;
  portal;
  bindAddress;
  udpPort;
  rpcMethodRegistry = {};
  isRunning = !1;
  constructor(t, e, r) {
    super(), this.portal = t, this.bindAddress = e, this.udpPort = r, this.socket = H({
      recvBufferSize: 16 * x,
      sendBufferSize: x,
      type: "udp4"
    }), this.registerRPCMethods(), this.socket.on("message", this.handleMessage.bind(this)), this.socket.on("error", (h) => {
      console.error("UDP Socket Error:", h), this.emit("error", h);
    });
  }
  registerRPCMethods() {
    this.rpcMethodRegistry = {
      portal_findNodes: this.handleFindNodes.bind(this),
      eth_getBlockByHash: this.handleEthGetBlockByHash.bind(this),
      eth_getBlockByNumber: this.handleEthGetBlockByNumber.bind(this)
    };
  }
  async start() {
    return new Promise((t, e) => {
      this.socket.bind(this.udpPort, this.bindAddress, () => {
        this.isRunning = !0, console.log(`UDP Server listening on ${this.bindAddress}:${this.udpPort}`), t();
      }), this.socket.on("error", e);
    });
  }
  async handleMessage(t, e) {
    try {
      const r = JSON.parse(t.toString());
      if (console.log(`Received request from ${e.address}:${e.port}:`, r), !r.method)
        throw new Error("Invalid request format - missing method");
      let h;
      if (this.rpcMethodRegistry[r.method])
        try {
          const f = await this.rpcMethodRegistry[r.method](r.params || []);
          h = O(f, !1);
        } catch (f) {
          h = {
            jsonrpc: "2.0",
            error: {
              code: -32e3,
              message: f instanceof Error ? f.message : "Unknown error"
            },
            id: r.id
          };
        }
      else
        h = {
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: `Method not found: ${r.method}`
          },
          id: r.id
        };
      console.log("Response (before serialization):", h);
      const y = JSON.stringify(h, (f, c) => typeof c == "bigint" ? c.toString() : c);
      console.log("serialized response ", y), this.socket.send(y, e.port, e.address, (f) => {
        f && console.error("Error sending response:", f);
      });
    } catch (r) {
      console.error("Error handling message:", r);
      const h = {
        error: r instanceof Error ? r.message : "Unknown error",
        id: null
      }, y = JSON.stringify(h, (f, c) => typeof c == "bigint" ? c.toString() : c);
      this.socket.send(y, e.port, e.address);
    }
  }
  async handleFindNodes(t) {
    if (!t || !t[0])
      throw new Error("Missing nodeId parameter");
    if (!this.portal)
      throw new Error("Node not initialized");
    return (await this.portal.discv5.findNode(t[0])).map((r) => {
      var h;
      return console.log(r), {
        nodeId: r.nodeId,
        multiaddr: (h = r.getLocationMultiaddr("udp")) == null ? void 0 : h.toString()
      };
    });
  }
  async handleEthGetBlockByHash(t) {
    if (console.log("here inside handler ..."), !t || !t[0])
      throw new Error("Missing Block Hash parameter");
    if (!this.portal)
      throw new Error("Node not initialized");
    return await this.portal.ETH.getBlockByHash(t[0], !1);
  }
  async handleEthGetBlockByNumber(t) {
    if (console.log("here inside handler ...", t), !t || !t[0])
      throw new Error("Missing Block Number parameter");
    if (!this.portal)
      throw new Error("Node not initialized");
    return await this.portal.ETH.getBlockByNumber(t[0], !1);
  }
  async stop() {
    return new Promise((t) => {
      if (!this.isRunning) {
        t();
        return;
      }
      const e = () => {
        this.isRunning = !1, t();
      };
      if (!this.isRunning) {
        e();
        return;
      }
      this.socket.once("close", e);
      try {
        this.socket.close(), this.socket.unref();
      } catch (r) {
        console.warn("Error while closing UDP socket:", r), e();
      }
    });
  }
}
const C = "PortalClient";
class B {
  node;
  historyNetwork;
  stateNetwork;
  enr;
  udpHandler;
  logger = A(C);
  async init(t = 9090, e = 8545) {
    try {
      const r = await M.generateKeyPair("secp256k1");
      this.enr = D.createFromPrivateKey(r);
      const h = b(`/ip4/0.0.0.0/udp/${t}`);
      this.enr.setLocationMultiaddr(h), this.node = await Y.create({
        transport: P.NODE,
        supportedNetworks: [
          { networkId: I.HistoryNetwork },
          { networkId: I.StateNetwork }
        ],
        config: {
          enr: this.enr,
          bindAddrs: { ip4: h },
          privateKey: r
        },
        bootnodes: Q.mainnet
      }), this.historyNetwork = this.node.network()["0x500b"], this.stateNetwork = this.node.network()["0x500a"], this.udpHandler = new L(this.node, "127.0.0.1", e), await this.node.start(), await this.udpHandler.start(), this.node.enableLog(C), this.logger("Portal Network initialized successfully"), this.logger("History Network status:", !!this.historyNetwork), this.logger("State Network status:", !!this.stateNetwork), this.logger(this.node);
    } catch (r) {
      throw console.log("Portal Network initialization failed:", r), r;
    }
    process.on("uncaughtException", (r) => {
      console.log("Uncaught Exception:", r);
    }), process.on("SIGINT", async () => {
      await this.shutdown();
    });
  }
  async shutdown() {
    var t, e;
    this.logger("Shutting down Portal Network node..."), await ((t = this.node) == null ? void 0 : t.stop()), await ((e = this.udpHandler) == null ? void 0 : e.stop());
  }
  getHistoryNetwork() {
    return this.historyNetwork;
  }
  getStateNetwork() {
    return this.stateNetwork;
  }
  getNode() {
    return this.node;
  }
  getUDPHandler() {
    return this.udpHandler;
  }
  // Network operation methods
  async bootstrap() {
    var t;
    await ((t = this.node) == null ? void 0 : t.bootstrap());
  }
}
async function J(u = 9090, t = 8545) {
  const e = new B();
  return await e.init(u, t), e;
}
async function U() {
  try {
    const u = parseInt(process.env.BIND_PORT || "9090"), t = parseInt(process.env.UDP_PORT || "8545"), e = await J(u, t), r = e.getUDPHandler();
    r && r.on("error", (h) => {
      console.error("UDP Socket error:", h);
    }), process.on("SIGINT", async () => {
      await e.shutdown(), process.exit(0);
    }), process.on("SIGTERM", async () => {
      await e.shutdown(), process.exit(0);
    }), console.log(`Portal Network started on ports: ${u} (bind) / ${t} (UDP)`);
  } catch (u) {
    console.error("Error initializing Portal Network:", u), process.exit(1);
  }
}
U().catch((u) => {
  console.error("Fatal error:", u), process.exit(1);
});
export {
  B as PortalClient
};
