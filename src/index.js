import ROM from "./rom/ROM";
import data from "arraybuffer!../data/backgrounds-truncated.dat";
export Engine from "./Engine";
export BackgroundLayer from "./rom/BackgroundLayer";
const backgroundData = new Uint8Array(data);
new ROM(new Uint8Array(data));