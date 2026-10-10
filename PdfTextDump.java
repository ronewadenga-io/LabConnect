import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.InflaterInputStream;

public class PdfTextDump {
    record Stream(int object, String dict, byte[] data, String text) {}

    public static void main(String[] args) throws Exception {
        byte[] pdf = Files.readAllBytes(Path.of(args[0]));
        String raw = new String(pdf, StandardCharsets.ISO_8859_1);
        List<Stream> streams = new ArrayList<>();
        Matcher matcher = Pattern.compile("(?s)(\\d+)\\s+\\d+\\s+obj\\s*<<(.*?)>>\\s*stream\\r?\\n").matcher(raw);
        while (matcher.find()) {
            int start = matcher.end();
            int end = raw.indexOf("endstream", start);
            if (end < 0) continue;
            int actualEnd = end;
            while (actualEnd > start && (pdf[actualEnd - 1] == '\r' || pdf[actualEnd - 1] == '\n')) actualEnd--;
            byte[] data = java.util.Arrays.copyOfRange(pdf, start, actualEnd);
            String dict = matcher.group(2);
            if (dict.contains("FlateDecode")) {
                try (var in = new InflaterInputStream(new ByteArrayInputStream(data)); var out = new ByteArrayOutputStream()) {
                    in.transferTo(out);
                    data = out.toByteArray();
                } catch (Exception ignored) { continue; }
            }
            streams.add(new Stream(Integer.parseInt(matcher.group(1)), dict, data, new String(data, StandardCharsets.ISO_8859_1)));
        }
        Map<String,String> cmap = new HashMap<>();
        Pattern bfchar = Pattern.compile("(?s)beginbfchar(.*?)endbfchar");
        Pattern pair = Pattern.compile("<([0-9A-Fa-f]+)>\\s*<([0-9A-Fa-f]+)>");
        for (Stream s : streams) {
            Matcher blocks = bfchar.matcher(s.text());
            while (blocks.find()) { Matcher p = pair.matcher(blocks.group(1)); while (p.find()) cmap.put(p.group(1).toUpperCase(), unicode(p.group(2))); }
            Pattern range = Pattern.compile("(?s)beginbfrange(.*?)endbfrange");
            Matcher ranges = range.matcher(s.text());
            while (ranges.find()) {
                Matcher r = Pattern.compile("<([0-9A-Fa-f]+)>\\s*<([0-9A-Fa-f]+)>\\s*<([0-9A-Fa-f]+)>").matcher(ranges.group(1));
                while (r.find()) {
                    int a = Integer.parseInt(r.group(1),16), b = Integer.parseInt(r.group(2),16), d = Integer.parseInt(r.group(3),16);
                    for (int c=a;c<=b && c-a<4096;c++) cmap.put(String.format("%0"+r.group(1).length()+"X",c), Character.toString((char)(d+c-a)));
                }
            }
        }
        System.out.println("PDF bytes="+pdf.length+" streams="+streams.size()+" cmap="+cmap.size());
        for (Stream s : streams) {
            if (!s.text().contains("BT") || !(s.text().contains("Tj") || s.text().contains("TJ"))) continue;
            System.out.println("--- object "+s.object()+" ---");
            Matcher texts = Pattern.compile("(?s)BT(.*?)ET").matcher(s.text());
            while(texts.find()) {
                String block=texts.group(1); StringBuilder out=new StringBuilder();
                Matcher hex=Pattern.compile("<([0-9A-Fa-f]+)>\\s*Tj|<([0-9A-Fa-f]+)>\\s*'").matcher(block);
                while(hex.find()) out.append(decodeHex(hex.group(1)!=null?hex.group(1):hex.group(2),cmap));
                Matcher lit=Pattern.compile("\\(((?:\\\\.|[^\\)])*)\\)\\s*Tj|\\(((?:\\\\.|[^\\)])*)\\)\\s*'").matcher(block);
                while(lit.find()) { String x=lit.group(1)!=null?lit.group(1):lit.group(2); if(x.chars().anyMatch(ch->ch>=32&&ch<127)) out.append(unescape(x)).append(' '); }
                Matcher arr=Pattern.compile("\\[(.*?)\\]\\s*TJ",Pattern.DOTALL).matcher(block);
                while(arr.find()) { Matcher h=Pattern.compile("<([0-9A-Fa-f]+)>").matcher(arr.group(1)); while(h.find()) out.append(decodeHex(h.group(1),cmap)); Matcher l=Pattern.compile("\\(((?:\\\\.|[^\\)])*)\\)").matcher(arr.group(1)); while(l.find()) out.append(unescape(l.group(1))); }
                String v=out.toString().replaceAll("[\\t ]+"," ").trim(); if(!v.isEmpty()) System.out.println(v);
            }
        }
    }
    static String decodeHex(String h, Map<String,String> cmap) {
        if(cmap.isEmpty()) { try { byte[] b=new byte[h.length()/2]; for(int i=0;i<b.length;i++) b[i]=(byte)Integer.parseInt(h.substring(i*2,i*2+2),16); return new String(b,StandardCharsets.UTF_16BE).replace("\u0000",""); } catch(Exception e) { return ""; } }
        StringBuilder s=new StringBuilder(); int width=cmap.keySet().stream().mapToInt(String::length).max().orElse(4); if(width%2!=0) width=4;
        for(int i=0;i+width<=h.length();i+=width) s.append(cmap.getOrDefault(h.substring(i,i+width).toUpperCase(),"�")); return s.toString();
    }
    static String unicode(String h) { try { byte[] b=new byte[h.length()/2]; for(int i=0;i<b.length;i++) b[i]=(byte)Integer.parseInt(h.substring(i*2,i*2+2),16); return new String(b,StandardCharsets.UTF_16BE); } catch(Exception e) { return ""; } }
    static String unescape(String x) { return x.replace("\\n","\n").replace("\\r","\n").replace("\\(","(").replace("\\)",")").replace("\\\\","\\"); }
}
