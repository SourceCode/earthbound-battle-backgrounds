import ROM from "./rom/ROM";
import data from "../data/backgrounds-truncated.dat";
export Engine from "./Engine";
export BackgroundLayer from "./rom/BackgroundLayer";
const backgroundData = new Uint8Array(Array.from(data).map(x => x.charCodeAt(0)));
new ROM(backgroundData);