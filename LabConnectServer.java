import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.Executors;

/** Serves the LabConnect HTML, CSS and JavaScript prototype using only the JDK. */
public final class LabConnectServer {
    private static final Map<String, String> CONTENT_TYPES = Map.ofEntries(
        Map.entry(".html", "text/html; charset=utf-8"),
        Map.entry(".css", "text/css; charset=utf-8"),
        Map.entry(".js", "text/javascript; charset=utf-8"),
        Map.entry(".svg", "image/svg+xml"),
        Map.entry(".png", "image/png"),
        Map.entry(".jpg", "image/jpeg"),
        Map.entry(".jpeg", "image/jpeg"),
        Map.entry(".webp", "image/webp"),
        Map.entry(".ico", "image/x-icon"),
        Map.entry(".woff2", "font/woff2"),
        Map.entry(".woff", "font/woff"),
        Map.entry(".ttf", "font/ttf")
    );

    private LabConnectServer() {}

    public static void main(String[] args) throws IOException {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : 8765;
        Path root = Path.of(".").toRealPath();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        server.createContext("/", exchange -> serve(exchange, root));
        server.setExecutor(Executors.newFixedThreadPool(
            Math.min(16, Math.max(2, Runtime.getRuntime().availableProcessors() / 2))));
        Runtime.getRuntime().addShutdownHook(new Thread(() -> server.stop(0)));
        server.start();
        System.out.println("LabConnect is running at http://127.0.0.1:" + port + "/");
        System.out.println("Press Ctrl+C to stop the server.");
    }

    private static void serve(HttpExchange exchange, Path root) throws IOException {
        String method = exchange.getRequestMethod();
        if (!method.equals("GET") && !method.equals("HEAD")) {
            exchange.getResponseHeaders().set("Allow", "GET, HEAD");
            send(exchange, 405, "Method not allowed");
            return;
        }

        String requestPath = exchange.getRequestURI().getPath();
        if (requestPath.equals("/")) requestPath = "/index.html";
        Path file = root.resolve(requestPath.substring(1)).normalize();
        if (!file.startsWith(root) || requestPath.contains("\\")
            || requestPath.endsWith(".java") || requestPath.startsWith("/db/")
            || requestPath.startsWith("/.git/")) {
            send(exchange, 404, "Not found");
            return;
        }

        if (!Files.isRegularFile(file)) {
            send(exchange, 404, "Not found");
            return;
        }
        Path actualFile = file.toRealPath();
        if (!actualFile.startsWith(root)) {
            send(exchange, 404, "Not found");
            return;
        }

        String name = actualFile.getFileName().toString();
        int dot = name.lastIndexOf('.');
        String extension = dot < 0 ? "" : name.substring(dot).toLowerCase();
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", CONTENT_TYPES.getOrDefault(extension, "application/octet-stream"));
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set("Cache-Control", "no-cache");
        long size = Files.size(actualFile);
        if (method.equals("HEAD")) {
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
            return;
        }
        exchange.sendResponseHeaders(200, size);
        try (var output = exchange.getResponseBody()) {
            Files.copy(actualFile, output);
        }
    }

    private static void send(HttpExchange exchange, int status, String message) throws IOException {
        byte[] body = message.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
        exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        exchange.sendResponseHeaders(status, body.length);
        try (var output = exchange.getResponseBody()) {
            output.write(body);
        }
    }
}
