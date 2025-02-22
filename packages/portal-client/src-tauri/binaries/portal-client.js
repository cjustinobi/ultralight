import { SignableENR as i } from "@chainsafe/enr";
import { keys as a } from "@libp2p/crypto";
import { multiaddr as c } from "@multiformats/multiaddr";
import { PortalNetwork as l, TransportLayer as g, NetworkId as n } from "portalnetwork";
import d from "debug";
const h = {
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
}, s = "PortalClient";
class w {
  node;
  historyNetwork;
  stateNetwork;
  enr;
  logger = d(s);
  isInitialized = !1;
  async init(t) {
    this.isInitialized && await this.shutdown();
    try {
      if (t <= 0)
        throw new Error("Invalid bind port number");
      const r = await a.generateKeyPair("secp256k1");
      this.enr = i.createFromPrivateKey(r);
      const e = c(`/ip4/0.0.0.0/udp/${t}`);
      this.enr.setLocationMultiaddr(e), this.node = await l.create({
        transport: g.NODE,
        supportedNetworks: [
          { networkId: n.HistoryNetwork },
          { networkId: n.StateNetwork }
        ],
        config: {
          enr: this.enr,
          bindAddrs: { ip4: e },
          privateKey: r
        },
        bootnodes: h.mainnet
      }), this.historyNetwork = this.node.network()["0x500b"], this.stateNetwork = this.node.network()["0x500a"], await this.node.start(), this.node.enableLog(s), this.isInitialized = !0, this.logger("Portal Network initialized successfully"), this.logger(`Bind Port: ${t}`), this.logger("History Network status:", !!this.historyNetwork), this.logger("State Network status:", !!this.stateNetwork);
    } catch (r) {
      throw this.logger("Portal Network initialization failed:", r), await this.cleanup(), r;
    }
  }
  async cleanup() {
    var t;
    try {
      await ((t = this.node) == null ? void 0 : t.stop());
    } catch (r) {
      this.logger("Cleanup error:", r);
    }
    this.isInitialized = !1, this.node = void 0;
  }
  async shutdown() {
    this.logger("Shutting down Portal Network node..."), await this.cleanup();
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
  async bootstrap() {
    var t;
    await ((t = this.node) == null ? void 0 : t.bootstrap());
  }
}
async function m(o) {
  const t = new w();
  return await t.init(o), t;
}
async function I() {
  let o;
  try {
    const t = parseInt(process.env.BIND_PORT || "9090");
    o = await m(t);
    const r = async () => {
      o && await o.shutdown(), process.exit(0);
    };
    process.on("SIGINT", r), process.on("SIGTERM", r), console.log(`Portal Network started on bind port: ${t}`);
  } catch (t) {
    console.error("Error initializing Portal Network:", t), o && await o.shutdown(), process.exit(1);
  }
}
I().catch(async (o) => {
  console.error("Fatal error:", o), process.exit(1);
});
export {
  w as PortalClient
};
