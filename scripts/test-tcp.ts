import * as dns from "dns";
import * as net from "net";

async function main() {
  const addresses = await new Promise<string[]>((resolve, reject) => {
    dns.resolve("db.eliwjdafimaugnwvadlr.supabase.co", "AAAA", (err, addrs) =>
      err ? reject(err) : resolve(addrs)
    );
  });

  const ipv6 = addresses[0];
  console.log("IPv6:", ipv6);

  const socket = net.createConnection({ host: ipv6, port: 5432, family: 6 });

  socket.on("connect", () => {
    console.log("TCP connect succeeded");
    socket.end();
  });

  socket.on("error", (err) => {
    console.error("TCP connect failed:", err.message);
    process.exit(1);
  });

  setTimeout(() => {
    console.error("TCP connect timed out");
    socket.destroy();
    process.exit(1);
  }, 10000);
}

main();
